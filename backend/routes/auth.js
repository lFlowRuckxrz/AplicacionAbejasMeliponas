const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Registro Inicial
router.post('/register', async (req, res) => {
  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.status(400).json({ error: 'El correo y la contraseña son obligatorios' });
  }

  try {
    const [existing] = await db.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Este correo ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO usuarios (correo, password) VALUES (?, ?)', 
      [correo, hashedPassword]
    );
    
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: { id: result.insertId, correo, rol: null }
    });
  } catch (error) {
    console.error('Error in /register:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Asignar rol a un usuario
router.put('/role', async (req, res) => {
  const { id, rol } = req.body;
  if (!id || !rol || !['apicultor', 'cliente'].includes(rol)) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }
  try {
    await db.query('UPDATE usuarios SET rol = ? WHERE id = ?', [rol, id]);
    res.json({ message: 'Rol asignado correctamente', rol });
  } catch (error) {
    console.error('Error in /role:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Inicio de sesión
router.post('/login', async (req, res) => {
  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.status(400).json({ error: 'El correo y la contraseña son obligatorios' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
    
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const unUsuario = rows[0];
    
    // Verificación de Contraseña Segura
    const isMatch = unUsuario.password ? await bcrypt.compare(password, unUsuario.password) : false;
    
    // Si la DB antigua no tenía contraseña para este usuario, la actualizamos "on-the-fly"
    if (!unUsuario.password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query('UPDATE usuarios SET password = ? WHERE id = ?', [hashedPassword, unUsuario.id]);
    } else if (!isMatch) {
        return res.status(401).json({ error: 'Contraseña o correo incorrectos' });
    }

    res.json({
      message: 'Inicio de sesión exitoso',
      user: { id: unUsuario.id, correo: unUsuario.correo, rol: unUsuario.rol, foto_perfil: unUsuario.foto_perfil, nombre: unUsuario.nombre }
    });
  } catch (error) {
    console.error('Error in /login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Update User Profile Image
router.put('/profile', async (req, res) => {
  const { id, foto_perfil } = req.body;
  try {
    const [result] = await db.query('UPDATE usuarios SET foto_perfil = ? WHERE id = ?', [foto_perfil, id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ message: 'Perfil actualizado exitosamente', foto_perfil });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Cambiar Contraseña
router.put('/password', async (req, res) => {
  const { id, currentPassword, newPassword } = req.body;
  if (!id || !newPassword) return res.status(400).json({ error: 'Datos incompletos' });

  try {
    const [rows] = await db.query('SELECT password FROM usuarios WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    
    const dbPassword = rows[0].password;
    if (dbPassword) {
        const isMatch = await bcrypt.compare(currentPassword || '', dbPassword);
        if (!isMatch) return res.status(401).json({ error: 'La contraseña actual es incorrecta' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE usuarios SET password = ? WHERE id = ?', [hashedPassword, id]);
    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Error in /password:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Update User Settings (Nombre)
router.put('/settings', async (req, res) => {
  const { id, nombre } = req.body;
  try {
    const [result] = await db.query('UPDATE usuarios SET nombre = ? WHERE id = ?', [nombre || null, id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ message: 'Ajustes guardados', nombre });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Almacenamiento temporal para los códigos de recuperación en memoria (ideal para demostraciones locales)
const recoveryCodes = new Map(); // Llave: correo, Valor: { code, expires }

const nodemailer = require('nodemailer');

// Configuración de Nodemailer Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_PORT === '465', // true para 465, false para otros puertos
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Función para enviar el correo electrónico de recuperación con plantilla profesional
async function sendRecoveryEmail(toEmail, code) {
  // Si no hay usuario configurado en .env, logueamos en consola (modo fallback para desarrollo)
  if (!process.env.SMTP_USER) {
    console.log('\n======================================================');
    console.log(`[CORREO SIMULADO] Enviando correo a: ${toEmail}`);
    console.log(`Código de recuperación: ${code}`);
    console.log('Para enviar correos reales, configura las variables SMTP en backend/.env');
    console.log('======================================================\n');
    return;
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || `"Soporte MeliHub" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: 'Restablecer Contraseña — MeliHub',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7f7f7; padding: 40px 20px; text-align: center;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border-top: 5px solid #d97706;">
          <div style="background-color: #1e293b; padding: 30px; text-align: center;">
            <h1 style="color: #f59e0b; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 1px;">MeliHub</h1>
            <p style="color: #cbd5e1; margin: 5px 0 0 0; font-size: 14px;">Geolocalización de Productores de Miel Melipona</p>
          </div>
          <div style="padding: 40px 30px; text-align: left; color: #334155; line-height: 1.6;">
            <h2 style="color: #1e293b; margin-top: 0; font-size: 20px;">Solicitud de Restablecimiento de Contraseña</h2>
            <p>Hola,</p>
            <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta de <strong>MeliHub</strong>. Utiliza el siguiente código de seguridad de 6 dígitos para completar el proceso:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <span style="display: inline-block; background-color: #fef3c7; color: #b45309; border: 1px solid #fde68a; font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 6px; padding: 12px 30px; border-radius: 8px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">${code}</span>
            </div>

            <p style="font-size: 14px; color: #64748b;">Este código tiene una validez temporal de <strong>15 minutos</strong>. Si tú no has solicitado este cambio, puedes ignorar este mensaje con total seguridad y tu contraseña permanecerá sin cambios.</p>
            
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
            <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-bottom: 0;">
              Este es un correo automático. Por favor, no respondas a este mensaje.<br/>
              © 2026 MeliHub — Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}

// Generar código de recuperación de contraseña (Envío de Correo Real)
router.post('/forgot-password', async (req, res) => {
  const { correo } = req.body;

  if (!correo) {
    return res.status(400).json({ error: 'El correo electrónico es requerido.' });
  }

  try {
    // Verificar si el usuario existe
    const [rows] = await db.query('SELECT id FROM usuarios WHERE correo = ?', [correo]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'El correo electrónico no está registrado.' });
    }

    // Generar un código aleatorio de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 15 * 60 * 1000; // Válido por 15 minutos

    // Guardar el código en memoria
    recoveryCodes.set(correo.toLowerCase().trim(), { code, expires });

    // Enviar el correo electrónico
    await sendRecoveryEmail(correo, code);

    res.json({
      message: 'Código de recuperación enviado con éxito al correo electrónico.'
    });
  } catch (error) {
    console.error('Error en /forgot-password:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// Restablecer contraseña usando el código de recuperación
router.post('/reset-password-with-code', async (req, res) => {
  const { correo, code, newPassword } = req.body;

  if (!correo || !code || !newPassword) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  const emailKey = correo.toLowerCase().trim();
  const activeToken = recoveryCodes.get(emailKey);

  if (!activeToken) {
    return res.status(400).json({ error: 'No se ha solicitado la recuperación para este correo o el código ha expirado.' });
  }

  if (activeToken.code !== code) {
    return res.status(400).json({ error: 'El código de recuperación es incorrecto.' });
  }

  if (Date.now() > activeToken.expires) {
    recoveryCodes.delete(emailKey);
    return res.status(400).json({ error: 'El código de recuperación ha expirado.' });
  }

  try {
    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar en la base de datos
    const [result] = await db.query('UPDATE usuarios SET password = ? WHERE correo = ?', [hashedPassword, correo]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // Limpiar el token de recuperación
    recoveryCodes.delete(emailKey);

    res.json({ message: 'Contraseña restablecida exitosamente.' });
  } catch (error) {
    console.error('Error en /reset-password-with-code:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

module.exports = router;
