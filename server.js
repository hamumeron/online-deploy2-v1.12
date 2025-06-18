const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3');
const { nanoid } = require('nanoid');
const path = require('path');

const app = express();
const db = new sqlite3.Database('./database.db');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

db.run(`CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  files TEXT
)`);

app.get('/', (req, res) => res.redirect('/new'));

app.get('/new', (req, res) => {
  res.render('editor', { id: null, files: {} });
});

app.get('/edit/:id', (req, res) => {
  db.get(`SELECT * FROM projects WHERE id = ?`, [req.params.id], (err, row) => {
    if (!row) return res.send('Not found');
    const files = JSON.parse(row.files);
    res.render('editor', { id: req.params.id, files });
  });
});

app.post('/save', (req, res) => {
  const id = req.body.id || nanoid(8);
  db.run(`REPLACE INTO projects (id, files) VALUES (?, ?)`,
    [id, JSON.stringify(req.body.files)], err => {
      if (err) return res.send('Error saving');
      res.json({ success: true, id });
    });
});

app.get('/view/:id', (req, res) => {
  db.get(`SELECT * FROM projects WHERE id = ?`, [req.params.id], (err, row) => {
    if (!row) return res.send('Not found');
    const files = JSON.parse(row.files);
    res.render('view', { files });
  });
});

app.listen(process.env.PORT || 3000, () => console.log('Server running'));
