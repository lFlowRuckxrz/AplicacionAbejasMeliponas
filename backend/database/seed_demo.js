const db = require('../config/db');
const bcrypt = require('bcryptjs'); // Or just store plain text if the app doesn't enforce hash everywhere, but auth.js uses bcrypt.
  
async function seedDemo() {
  console.log('Seeding Demo User for Presentation...');
  
  try {
    const passwordHash = await bcrypt.hash('Maestra123', 10);
    
    // 1. Insert User
    const [userRes] = await db.query(
      `INSERT INTO usuarios (correo, password, nombre, rol) 
       VALUES (?, ?, ?, ?)`,
      ['maestra@demo.com', passwordHash, 'Apicultor Maestro Demo', 'apicultor']
    );
    
    const userId = userRes.insertId;
    console.log('User created! ID:', userId, 'Email: maestra@demo.com', 'Pass: Maestra123');

    // 2. Insert Business
    const productos = [
      { nombre: 'Miel Melipona Oro 500ml', precio: '$600 MXN' },
      { nombre: 'Gotas para Ojos (Miel Virgen)', precio: '$250 MXN' },
      { nombre: 'Jabón Exfoliante de Cera', precio: '$120 MXN' },
      { nombre: 'Propóleo Melipona', precio: '$350 MXN' }
    ];

    const contacto = {
      correo: 'contacto@apiariomaestro.mx',
      telefono: '9991234567',
      direccion: 'Ruta de los Cenotes Km 4, Puerto Morelos',
      sitioWeb: 'https://meliponario-maestro.mx'
    };

    const coordenadas = {
      lat: 20.8447,
      lng: -86.8756,
      estado: 'Quintana Roo' // Ensuring consistency
    };

    await db.query(
      `INSERT INTO negocios (
        usuario_id, nombre, logo_url, productos, tipo_miel, flor_origen, 
        estado, coordenadas, contacto, descripcion, vistas, contactos
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        'Reserva Melipona Maestra',
        'https://images.unsplash.com/photo-1587334274328-64186a80aeee?w=800&q=80',
        JSON.stringify(productos),
        'Orgánica',
        'Tajonal y Dzidzilché',
        'Quintana Roo',
        JSON.stringify(coordenadas),
        JSON.stringify(contacto),
        'Este es el apiario de demostración oficial (MeliHub). Nuestra miel es cosechada con los máximos estándares de calidad en el corazón de Quintana Roo.',
        124, 
        45
      ]
    );

    console.log('✅ Demo business successfully created.');

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('Demo user already exists.');
    } else {
      console.error('❌ Error during seeding:', error);
    }
  } finally {
    process.exit(0);
  }
}

seedDemo();
