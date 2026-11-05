const http = require('http');
const sql = require('mssql');

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: { encrypt: true, trustServerCertificate: false },
  connectionTimeout: 60000
};

let poolPromise = null;
function getPool() {
  if (!poolPromise) {
    poolPromise = sql.connect(config).catch(err => {
      poolPromise = null;
      throw err;
    });
  }
  return poolPromise;
}

const server = http.createServer(async (req, res) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };
  try {
    const pool = await getPool();
    const r = await pool.request().query('SELECT * FROM peliculas');
    res.writeHead(200, headers);
    res.end(JSON.stringify(r.recordset));
  } catch (err) {
    console.error(err);
    res.writeHead(500, headers);
    res.end(JSON.stringify({ error: err.message }));
  }
});

const port = process.env.PORT || 3000;
server.listen(port, '0.0.0.0', () => {
  console.log('API escuchando en puerto ' + port);
});
