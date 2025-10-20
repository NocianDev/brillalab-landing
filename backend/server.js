// backend/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;
const DB_PATH = path.join(__dirname, 'contacts.db');

// Middleware
app.use(helmet());
app.use(express.json()); // parse application/json
app.use(cors()); // en desarrollo, permite todas las peticiones. En producción ajusta el origin

// Rate limiting básico (evita spam)
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 30, // 30 requests por IP por minuto
});
app.use(limiter);

// Inicializar DB y tabla
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error abriendo DB', err);
    process.exit(1);
  }
  console.log('Base de datos SQLite abierta en', DB_PATH);
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Endpoint de ejemplo -> guarda contacto
app.post('/api/contact', (req, res) => {
  try {
    const { name, email, message } = req.body || {};

    // Validación simple
    if (!name || !email) {
      return res.status(400).json({ error: 'Nombre y correo son obligatorios' });
    }

    // Inserción segura con placeholders
    const stmt = db.prepare('INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)');
    stmt.run(name, email, message || null, function (err) {
      if (err) {
        console.error('DB insert error', err);
        return res.status(500).json({ error: 'Error al guardar en la base de datos' });
      }
      res.json({ ok: true, id: this.lastID });
    });
    stmt.finalize();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Endpoint opcional para listar (solo para pruebas; en producción protege esto)
app.get('/api/contacts', (req, res) => {
  db.all('SELECT id, name, email, message, created_at FROM contacts ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error al leer DB' });
    res.json(rows);
  });
});

// Cerrar DB al terminar (opcional)
process.on('SIGINT', () => {
  db.close();
  process.exit();
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
