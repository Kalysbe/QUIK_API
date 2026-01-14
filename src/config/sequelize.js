import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

export const pgSequelize = new Sequelize(
  process.env.POSTGRES_DB,
  process.env.POSTGRES_USER,
  process.env.POSTGRES_PASSWORD,
  {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    dialect: "postgres",
    logging: false,
  }
);

export async function testPostgresConnection() {
  try {
    await pgSequelize.authenticate();
    console.log("✅ Sequelize подключен к PostgreSQL:", new Date().toISOString());
  } catch (error) {
    console.error("❌ Ошибка подключения Sequelize к PostgreSQL:", error.message);
  }
}
