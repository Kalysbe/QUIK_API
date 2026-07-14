import sql from "mssql";
import dotenv from "dotenv";
import logger from "../utils/logger.js";
dotenv.config();

const config = {
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  server: process.env.MSSQL_HOST,
  database: process.env.MSSQL_DB,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool = null;
let poolConnect = null;

function createPool() {
  pool = new sql.ConnectionPool(config);
  pool.on("error", (err) => {
    // Сбрасываем pool при фатальной ошибке, чтобы следующий запрос переподключился
    logger.error("MSSQL pool error", { error: err?.message || String(err) });
    pool = null;
    poolConnect = null;
  });
  poolConnect = pool.connect().catch((err) => {
    pool = null;
    poolConnect = null;
    throw err;
  });
  return poolConnect;
}

/**
 * Получает подключенный pool MSSQL (с переподключением после сбоя)
 * @returns {Promise<sql.ConnectionPool>}
 */
export async function getMssqlPool() {
  if (!pool || !pool.connected) {
    if (!poolConnect) {
      createPool();
    }
  }

  try {
    await poolConnect;
  } catch {
    createPool();
    await poolConnect;
  }

  if (!pool?.connected) {
    createPool();
    await poolConnect;
  }

  return pool;
}

export { sql, poolConnect, pool };
