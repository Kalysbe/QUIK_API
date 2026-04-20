import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const pool = new pg.Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  // Совпадает с календарной датой в pgAdmin (иначе timestamptz + to_char могут быть в UTC).
  ...(process.env.POSTGRES_TIMEZONE
    ? { options: `-c TimeZone=${process.env.POSTGRES_TIMEZONE}` }
    : {}),
});

export default pool;




