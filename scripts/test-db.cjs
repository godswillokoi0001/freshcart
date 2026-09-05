const { Pool } = require('pg');

function getDbConfig() {
  const raw = process.env.DATABASE_URL || '';
  const prefix = 'postgresql://';
  if (!raw.startsWith(prefix)) {
    return { connectionString: raw };
  }
  const lastAt = raw.lastIndexOf('@');
  if (lastAt === -1) {
    return { connectionString: raw };
  }
  const userPassPart = raw.slice(prefix.length, lastAt);
  const colonIdx = userPassPart.indexOf(':');
  const user = userPassPart.slice(0, colonIdx);
  const password = userPassPart.slice(colonIdx + 1);
  
  const hostPart = raw.slice(lastAt + 1);
  const slashIdx = hostPart.indexOf('/');
  const hostAndPort = slashIdx !== -1 ? hostPart.slice(0, slashIdx) : hostPart;
  const database = slashIdx !== -1 ? hostPart.slice(slashIdx + 1) : 'postgres';
  
  const [host, portStr] = hostAndPort.split(':');
  const port = parseInt(portStr || '5432', 10);
  
  return {
    user,
    password,
    host,
    port,
    database,
    ssl: { rejectUnauthorized: false },
  };
}

const config = getDbConfig();
console.log('Parsed config:', { user: config.user, host: config.host, port: config.port, database: config.database });

const pool = new Pool(config);

pool.query('SELECT current_database(), current_user, version();', (err, res) => {
  if (err) {
    console.error('Connection failed:', err.message);
  } else {
    console.log('Connected successfully!', res.rows[0]);
    pool.query('SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\';', (err2, res2) => {
      if (err2) {
        console.error('Tables query error:', err2.message);
      } else {
        console.log('Existing tables in public schema:', res2.rows.map(r => r.table_name));
      }
      pool.end();
    });
  }
});
