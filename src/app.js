import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import instrumentsRoutes from "./routes/instrumentsRoutes.js";
import bondRoutes from "./routes/bondRoutes.js";
import firmRoutes from "./routes/firmRoutes.js";
import depoLimitRoutes from "./routes/depoLimitRoutes.js";
import moneyLimitRoutes from "./routes/moneyLimitRoutes.js";
import trdaccRoutes from "./routes/trdaccRoutes.js";
import classesRoutes from "./routes/classesRoutes.js";
import securitiesRoutes from "./routes/securitiesRoutes.js";
import tradeAccountsRoutes from "./routes/tradeAccountsRoutes.js";
import settleCodesRoutes from "./routes/settleCodesRoutes.js";
import tagsRoutes from "./routes/tagsRoutes.js";
import clientsRoutes from "./routes/clientsRoutes.js";
import schedulesRoutes from "./routes/schedulesRoutes.js";
import coreGroupsRoutes from "./routes/coreGroupsRoutes.js";
import calendarsRoutes from "./routes/calendarsRoutes.js";
import complexProductRoutes from "./routes/complexProductRoutes.js";
import brokersRoutes from "./routes/brokersRoutes.js";
import lastTradingDateTimeRoutes from "./routes/lastTradingDateTimeRoutes.js";
import priceLimitsRoutes from "./routes/priceLimitsRoutes.js";
import securityParamsRoutes from "./routes/securityParamsRoutes.js";
import tradeCreationRoutes from "./routes/tradeCreationRoutes.js";
import personsRoutes from "./routes/personsRoutes.js";
import couponsRoutes from "./routes/couponsRoutes.js";
import extraParamsRoutes from "./routes/extraParamsRoutes.js";
import auctionsRoutes from "./routes/auctionsRoutes.js";
import accruedIntRoutes from "./routes/accruedIntRoutes.js";
import faceValuesRoutes from "./routes/faceValuesRoutes.js";
import crossratesRoutes from "./routes/crossratesRoutes.js";
import { requestLogger } from "./utils/logger.js";
import { ipWhitelistMiddleware } from "./middleware/ipWhitelist.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();

// Парсинг JSON
app.use(express.json());

// Swagger JSON endpoint (должен быть самым первым, до любых middleware)
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.json(swaggerSpec);
});

// Swagger UI (должен быть до middleware, устанавливающих Content-Type)
// Добавляем middleware для правильной установки Content-Type для HTML
app.use("/api-docs", (req, res, next) => {
  // Для HTML страниц Swagger UI устанавливаем правильный Content-Type
  if (req.path === "/api-docs" || req.path === "/api-docs/") {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
  }
  next();
});

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .auth-wrapper { display: none !important; }
      .swagger-ui .authorization__btn { display: none !important; }
    `,
    customSiteTitle: "QUIK Module API Documentation",
    swaggerOptions: {
      persistAuthorization: false,
      tryItOutEnabled: true,
    },
  })
);

// Установка заголовков (исключая Swagger UI и статические файлы)
app.use((req, res, next) => {
  // Не устанавливаем Content-Type для Swagger UI и статических файлов
  if (!req.path.startsWith("/api-docs") && !req.path.startsWith("/swagger-ui")) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
  }
  next();
});

// Логирование запросов
app.use(requestLogger);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     description: Проверка работоспособности сервера. Доступен без проверки IP
 *     responses:
 *       200:
 *         description: Сервер работает
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                 environment:
 *                   type: string
 */
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
app.use("/api/instruments", instrumentsRoutes); // Alias for convenience
app.use("/api/bonds", bondRoutes);
app.use("/api/firms", firmRoutes);
app.use("/api/depolimits", depoLimitRoutes);
app.use("/api/moneylimits", moneyLimitRoutes);
app.use("/api/trdaccs", trdaccRoutes);
app.use("/api/classes", classesRoutes);
app.use("/api/securities", securitiesRoutes);
app.use("/api/trade-accounts", tradeAccountsRoutes);
app.use("/api/settle-codes", settleCodesRoutes);
app.use("/api/tags", tagsRoutes);
app.use("/api/clients", clientsRoutes);
app.use("/api/schedules", schedulesRoutes);
app.use("/api/core-groups", coreGroupsRoutes);
app.use("/api/calendars", calendarsRoutes);
app.use("/api/complex-product", complexProductRoutes);
app.use("/api/brokers", brokersRoutes);
app.use("/api/last-trading-date-time", lastTradingDateTimeRoutes);
app.use("/api/price-limits", priceLimitsRoutes);
app.use("/api/security-params", securityParamsRoutes);
app.use("/api/trade-creation", tradeCreationRoutes);
app.use("/api/persons", personsRoutes);
app.use("/api/coupons", couponsRoutes);
app.use("/api/extra-params", extraParamsRoutes);
app.use("/api/auctions", auctionsRoutes);
app.use("/api/accrued-int", accruedIntRoutes);
app.use("/api/face-values", faceValuesRoutes);
app.use("/api/crossrates", crossratesRoutes);

// Обработка 404
app.use(notFoundHandler);

// Централизованная обработка ошибок (должен быть последним)
app.use(errorHandler);

export default app;
