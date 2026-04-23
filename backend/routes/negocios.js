const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todos los negocios
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM negocios ORDER BY creado_en DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error in GET /negocios:', error);
    res.status(500).json({ error: 'Error al obtener los negocios' });
  }
});

// Crear un negocio
router.post('/', async (req, res) => {
  const {
    usuario_id,
    nombre,
    productos,
    tipoMiel, // Mapping camelCase to snake_case if necessary
    florOrigen,
    estado,
    coordenadas,
    contacto,
    descripcion,
    logo_url
  } = req.body;

  if (!usuario_id || !nombre || !estado) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO negocios (
        usuario_id, nombre, logo_url, productos, tipo_miel, flor_origen, 
        estado, coordenadas, contacto, descripcion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        usuario_id, 
        nombre, 
        logo_url || null,
        JSON.stringify(productos || []), 
        tipoMiel || req.body.tipo_miel || null, 
        florOrigen || req.body.flor_origen || null, 
        estado, 
        JSON.stringify(coordenadas || null), 
        JSON.stringify(contacto || {}), 
        descripcion || null
      ]
    );

    const [newNegocio] = await db.query('SELECT * FROM negocios WHERE id = ?', [result.insertId]);
    res.status(201).json(newNegocio[0]);
  } catch (error) {
    console.error('Error in POST /negocios:', error);
    res.status(500).json({ error: 'Error al crear el negocio' });
  }
});

// Actualizar un negocio
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const {
    nombre,
    productos,
    tipoMiel,
    florOrigen,
    estado,
    coordenadas,
    contacto,
    descripcion,
    logo_url
  } = req.body;

  try {
    await db.query(
      `UPDATE negocios SET 
        nombre = COALESCE(?, nombre),
        logo_url = COALESCE(?, logo_url),
        productos = COALESCE(?, productos),
        tipo_miel = COALESCE(?, tipo_miel),
        flor_origen = COALESCE(?, flor_origen),
        estado = COALESCE(?, estado),
        coordenadas = COALESCE(?, coordenadas),
        contacto = COALESCE(?, contacto),
        descripcion = COALESCE(?, descripcion)
      WHERE id = ?`,
      [
        nombre || null,
        logo_url || req.body.logo_url || null,
        productos ? JSON.stringify(productos) : null,
        tipoMiel || req.body.tipo_miel || null,
        florOrigen || req.body.flor_origen || null,
        estado || null,
        coordenadas ? JSON.stringify(coordenadas) : null,
        contacto ? JSON.stringify(contacto) : null,
        descripcion || null,
        id
      ]
    );

    const [updatedNegocio] = await db.query('SELECT * FROM negocios WHERE id = ?', [id]);
    res.json(updatedNegocio[0]);
  } catch (error) {
    console.error('Error in PUT /negocios:', error);
    res.status(500).json({ error: 'Error al actualizar el negocio' });
  }
});

// Eliminar un negocio
router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await db.query('DELETE FROM negocios WHERE id = ?', [id]);
    res.json({ message: 'Negocio eliminado exitosamente' });
  } catch (error) {
    console.error('Error in DELETE /negocios:', error);
    res.status(500).json({ error: 'Error al eliminar el negocio' });
  }
});

// Incrementar interacciones (vistas/contactos)
router.post('/:id/interact', async (req, res) => {
  const id = req.params.id;
  const { action } = req.body; // 'view' or 'contact'
  
  try {
    if (action === 'view') {
      await db.query('UPDATE negocios SET vistas = vistas + 1 WHERE id = ?', [id]);
    } else if (action === 'contact') {
      await db.query('UPDATE negocios SET contactos = contactos + 1 WHERE id = ?', [id]);
    } else {
      return res.status(400).json({ error: 'invalid action' });
    }
    
    // Devolvemos el estado actual para que el frontend lo refresque
    const [negocio] = await db.query('SELECT vistas, contactos FROM negocios WHERE id = ?', [id]);
    res.json(negocio[0]);
  } catch (error) {
    console.error('Error tracking interaction:', error);
    res.status(500).json({ error: 'Failed to update stats' });
  }
});

module.exports = router;
