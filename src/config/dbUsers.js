import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const pool = new pg.Pool({
  host: process.env.USERS_DB_HOST,
  port: process.env.USERS_DB_PORT,
  user: process.env.USERS_DB_USER,
  password: process.env.USERS_DB_PASSWORD,
  database: process.env.USERS_DB_NAME,
});

export default pool;
