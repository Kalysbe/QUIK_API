// src/config/swagger.js
import swaggerJsdoc from "swagger-jsdoc";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "QUIK Module API",
      version: "1.0.0",
      description: "API для QUIK Module",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url: `http://${process.env.SERVER_HOST || "127.0.0.1"}:${process.env.PORT || 5000}`,
        description: "Server",
      },
    ],
  },
  apis: [
    join(__dirname, "../routes/*.js").replace(/\\/g, "/"),
    join(__dirname, "../controllers/*.js").replace(/\\/g, "/"),
  ],
};

const swaggerSpec = swaggerJsdoc(options);

// Скрываем операции и теги с флагом x-hidden: true
if (swaggerSpec && swaggerSpec.paths) {
  const hiddenTags = new Set(
    Array.isArray(swaggerSpec.tags)
      ? swaggerSpec.tags
          .filter((tag) => tag && tag["x-hidden"] === true)
          .map((tag) => tag.name)
          .filter(Boolean)
      : []
  );

  for (const [pathKey, methods] of Object.entries(swaggerSpec.paths)) {
    for (const [methodKey, operation] of Object.entries(methods || {})) {
      const opTags = Array.isArray(operation?.tags) ? operation.tags : [];
      const hasHiddenTag = opTags.some((tag) => hiddenTags.has(tag));

      if (operation && (operation["x-hidden"] === true || hasHiddenTag)) {
        delete swaggerSpec.paths[pathKey][methodKey];
      }
    }

    if (Object.keys(swaggerSpec.paths[pathKey]).length === 0) {
      delete swaggerSpec.paths[pathKey];
    }
  }
}

if (swaggerSpec && Array.isArray(swaggerSpec.tags)) {
  swaggerSpec.tags = swaggerSpec.tags.filter((tag) => tag && tag["x-hidden"] !== true);
}

// Проверка, что схема сгенерирована
if (!swaggerSpec || !swaggerSpec.paths || Object.keys(swaggerSpec.paths).length === 0) {
  console.warn("⚠️  Swagger схема пуста или не найдены endpoints. Проверьте JSDoc комментарии в роутах.");
} else {
  console.log(`✅ Swagger схема загружена: найдено ${Object.keys(swaggerSpec.paths).length} endpoints`);
}

export default swaggerSpec;

