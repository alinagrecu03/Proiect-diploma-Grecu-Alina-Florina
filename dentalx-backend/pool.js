// importam libraria pg pentru a putea face conexiunea cu postgresql
const Pool = require('pg').Pool;

// initializam conexiunea cu baza de date PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'medro',
  password: 'admin',
  port: 5432,
});

// exportam obiectul pentru a putea fi folosit in app.js
module.exports = {
    pool
}