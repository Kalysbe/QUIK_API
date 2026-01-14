import express from "express";
import app from "./app.js";
import dotenv from "dotenv";
import pgPool from "./config/dbPostgres.js"; // подключение к PostgreSQL
import job from "./cron/cronJob.js"; // ← импортируем задачу
import logger from "./utils/logger.js";
import { 
  setupUnhandledRejectionHandler, 
  setupUncaughtExceptionHandler 
} from "./middleware/errorHandler.js";

dotenv.config();

// Настройка обработчиков необработанных исключений
setupUnhandledRejectionHandler();
setupUncaughtExceptionHandler();

const PORT = process.env.PORT || 5000;

// КРИТИЧЕСКИ ВАЖНО: Сервер НЕ должен слушать 0.0.0.0
// Используем конкретный IP из переменных окружения или localhost
const HOST = process.env.SERVER_HOST || '127.0.0.1';

// Проверяем, что не используется 0.0.0.0
if (HOST === '0.0.0.0') {
  logger.error('SECURITY ERROR: Server cannot listen on 0.0.0.0. Use specific IP or 127.0.0.1');
  process.exit(1);
}

let server;

async function testConnections() {
  logger.info("🔍 Проверяем подключения к базам...");

  // Проверка PostgreSQL
  try {
    const res = await pgPool.query("SELECT NOW()");
    logger.info("✅ PostgreSQL подключен успешно", { timestamp: res.rows[0].now });
  } catch (err) {
    logger.error("❌ Ошибка подключения к PostgreSQL", { error: err.message });
    throw err; // Прерываем запуск при ошибке подключения
  }

  logger.info("✅ Проверка подключений завершена");
}

async function startServer() {
  try {
    // Проверяем подключения перед запуском
    await testConnections();

    // Запускаем cron job
    job.start();
    logger.info("✅ Cron job запущен");

    // Запускаем сервер
    server = app.listen(PORT, HOST, () => {
      logger.info(`🚀 Server running on ${HOST}:${PORT}`, {
        host: HOST,
        port: PORT,
        environment: process.env.NODE_ENV || 'production',
        allowedNetworks: process.env.ALLOWED_NETWORKS || 'default (192.168.0.0/16, 10.0.0.0/8, 172.16.0.0/12)'
      });
    });

    // Обработка ошибок сервера
    server.on('error', (error) => {
      logger.error('Server error', { error: error.message, stack: error.stack });
      process.exit(1);
    });

    // Graceful shutdown
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    logger.error('Failed to start server', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

function gracefulShutdown(signal) {
  logger.info(`Received ${signal}, starting graceful shutdown...`);

  // Останавливаем прием новых подключений
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');

      // Останавливаем cron job
      job.stop();
      logger.info('Cron job stopped');

      // Закрываем подключения к БД
      pgPool.end()
        .then(() => {
          logger.info('Database connections closed');
          process.exit(0);
        })
        .catch((err) => {
          logger.error('Error closing database connections', { error: err.message });
          process.exit(1);
        });
    });

    // Принудительное завершение через 10 секунд
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
}

// Запуск сервера
startServer();
