import logger from '../utils/logger.js';

/**
 * Централизованный обработчик ошибок Express
 */
export function errorHandler(err, req, res, next) {
  // Логируем ошибку
  logger.error('Unhandled error', {
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name
    },
    request: {
      method: req.method,
      url: req.url,
      ip: req.clientIP || req.ip,
      body: req.body,
      params: req.params,
      query: req.query
    }
  });

  // Определяем статус код
  const statusCode = err.statusCode || err.status || 500;

  // Формируем ответ
  const response = {
    success: false,
    message: err.message || 'Внутренняя ошибка сервера',
    error: err.name || 'InternalServerError'
  };

  // В режиме разработки добавляем stack trace
  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  // Специальная обработка для известных типов ошибок
  if (err.name === 'ValidationError') {
    response.error = 'VALIDATION_ERROR';
    response.details = err.details || err.errors;
  }

  if (err.name === 'UnauthorizedError') {
    response.error = 'UNAUTHORIZED';
  }

  res.status(statusCode).json(response);
}

/**
 * Middleware для обработки 404 ошибок
 */
export function notFoundHandler(req, res, next) {
  const err = new Error(`Route not found: ${req.method} ${req.url}`);
  err.statusCode = 404;
  err.name = 'NotFoundError';
  next(err);
}

/**
 * Обработчик для необработанных промисов
 */
export function setupUnhandledRejectionHandler() {
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Promise Rejection', {
      reason: reason instanceof Error ? {
        message: reason.message,
        stack: reason.stack,
        name: reason.name
      } : reason,
      promise: promise.toString()
    });

    // В продакшене не завершаем процесс, только логируем
    // PM2 автоматически перезапустит приложение при необходимости
  });
}

/**
 * Обработчик для необработанных исключений
 */
export function setupUncaughtExceptionHandler() {
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      }
    });

    // Даем время на логирование, затем завершаем процесс
    // PM2 автоматически перезапустит приложение
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });
}

