// src/controllers/ordersController.js
import { fetchActiveOrders } from "../services/ordersService.js";

/**
 * GET /api/orders
 * Возвращает только активные заявки (State = "Активна") с полями:
 * OrderNum, ClassCode, SecCode, Price, Qty, Value, OrderDateTime, Operation, State.
 * Фильтрация по всем указанным столбцам через query-параметры.
 */
export async function getOrders(req, res, next) {
  try {
    const rows = await fetchActiveOrders(req.query);
    res.json(rows);
  } catch (err) {
    if (err.status === 404) {
      return res.status(404).json({
        success: false,
        message: err.message,
      });
    }
    if (err.status === 400) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
}
