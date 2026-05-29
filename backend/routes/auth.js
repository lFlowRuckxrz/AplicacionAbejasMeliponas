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

module.exports = router;
