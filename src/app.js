import express from "express";
import instrumentsRoutes from "./routes/instrumentsRoutes.js";
import bondRoutes from "./routes/bondRoutes.js";
import firmRoutes from "./routes/firmRoutes.js";
import depoLimitRoutes from "./routes/depoLimitRoutes.js";
import moneyLimitRoutes from "./routes/moneyLimitRoutes.js";
import trdaccRoutes from "./routes/trdaccRoutes.js";
import { requestLogger } from "./utils/logger.js";
import { ipWhitelistMiddleware } from "./middleware/ipWhitelist.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();

// Парсинг JSON
app.use(express.json());

// Установка заголовков
app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  next();
});

// Логирование запросов (должно быть первым)
app.use(requestLogger);

// Health check endpoint (доступен без проверки IP для мониторинга)
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "production"
  });
});

// Проверка IP адреса (только локальная сеть) - применяется ко всем остальным маршрутам
app.use(ipWhitelistMiddleware);

// Маршруты
app.use("/api/instruments", instrumentsRoutes);
app.use("/instruments", instrumentsRoutes); // Alias for convenience
app.use("/api/bonds", bondRoutes);
app.use("/api/firms", firmRoutes);
app.use("/api/depolimits", depoLimitRoutes);
app.use("/api/moneylimits", moneyLimitRoutes);
app.use("/api/trdaccs", trdaccRoutes);

// Обработка 404
app.use(notFoundHandler);

// Централизованная обработка ошибок (должен быть последним)
app.use(errorHandler);

export default app;
