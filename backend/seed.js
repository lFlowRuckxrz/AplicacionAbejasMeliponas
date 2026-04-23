const db = require('./db');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    try {
      await db.query('ALTER TABLE usuarios ADD COLUMN password VARCHAR(255), ADD COLUMN nombre VARCHAR(100), ADD COLUMN foto_perfil VARCHAR(255)');
    } catch (e) {}
    try {
      await db.query('ALTER TABLE negocios ADD COLUMN logo_url VARCHAR(255)');
    } catch (e) {}

    const seedData = [
      {
        usuario: { correo: 'maria@apiario.com', nombre: 'María García López', password: 'password123' },
        negocio: {
          nombre: 'Apiario San José',
          productos: ['Miel de Melipona', 'Propóleo', 'Polen'],
          tipo_miel: 'Melipona beecheii',
          flor_origen: 'Multiflora',
          estado: 'Yucatán',
          coordenadas: { lat: 20.9700, lng: -89.6200 },
          contacto: { direccion: 'Mérida, Carretera Mérida-Tixkokob km 15' },
          descripcion: 'Apiario familiar dedicado a la producción de miel de abeja melipona desde hace más de 20 años. Ofrecemos miel 100% pura y natural con propiedades medicinales.',
          logo_url: null
        }
      },
      {
        usuario: { correo: 'juan@meliponas.com', nombre: 'Juan Carlos Pech', password: 'password123' },
        negocio: {
          nombre: 'Meliponas del Mayab',
          productos: ['Miel de Melipona', 'Miel en Panal', 'Cera'],
          tipo_miel: 'Melipona beecheii',
          flor_origen: 'Tsalam y Dzidzilché',
          estado: 'Campeche',
          coordenadas: { lat: 18.5800, lng: -89.4100 },
          contacto: { direccion: 'Calakmul, Comunidad de Zoh-Laguna' },
          descripcion: 'Preservamos las tradiciones mayas en la crianza de abejas meliponas. Producción sustentable y amigable con el medio ambiente.',
          logo_url: null
        }
      },
      {
        usuario: { correo: 'rosa@abejasnativas.com', nombre: 'Rosa Elena Chan', password: 'password123' },
        negocio: {
          nombre: 'Abejas Nativas X\'tabay',
          productos: ['Miel de Melipona', 'Propóleo', 'Jalea Real'],
          tipo_miel: 'Melipona beecheii',
          flor_origen: 'Tajumpa',
          estado: 'Quintana Roo',
          coordenadas: { lat: 19.5700, lng: -88.0400 },
          contacto: { direccion: 'Felipe Carrillo Puerto, Calle 60 #234, Centro' },
          descripcion: 'Cooperativa de mujeres mayas dedicadas a la meliponicultura. Miel artesanal con certificación orgánica.',
          logo_url: null
        }
      }
    ];

    for (const data of seedData) {
      const [existing] = await db.query('SELECT * FROM usuarios WHERE correo = ?', [data.usuario.correo]);
      let userId;
      if (existing.length === 0) {
        const hash = await bcrypt.hash(data.usuario.password, 10);
        const [res] = await db.query('INSERT INTO usuarios (correo, rol, password, nombre) VALUES (?, ?, ?, ?)', 
          [data.usuario.correo, 'apicultor', hash, data.usuario.nombre]);
        userId = res.insertId;
      } else {
        userId = existing[0].id;
      }

      await db.query('DELETE FROM negocios WHERE usuario_id = ?', [userId]);

      const n = data.negocio;
      await db.query(`INSERT INTO negocios 
        (usuario_id, nombre, productos, tipo_miel, flor_origen, estado, coordenadas, contacto, descripcion, logo_url) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
        [userId, n.nombre, JSON.stringify(n.productos), n.tipo_miel, n.flor_origen, n.estado, JSON.stringify(n.coordenadas), JSON.stringify(n.contacto), n.descripcion, n.logo_url]
      );
    }
    
    console.log('🐝 Base de datos poblada con éxito con los negocios proporcionados!');
    process.exit(0);
  } catch (err) {
    console.error('Seed Error:', err);
    process.exit(1);
  }
}
seed();