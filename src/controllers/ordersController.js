// src/controllers/ordersController.js
import pgPool from "../config/dbPostgres.js";

/** Кандидаты имён колонок для маппинга (в порядке приоритета) */
const COLUMN_CANDIDATES = {
  OrderNum: ["OrderNum", "ordernum", "order_num"],
  ClassCode: ["ClassCode", "classcode", "class_code"],
  SecCode: ["SecCode", "seccode", "sec_code"],
  Price: ["Price", "price"],
  Qty: ["Qty", "qty", "Quantity", "quantity"],
  Value: ["Value", "value", "Amount", "amount"],
  OrderDateTime: ["OrderDateTime", "orderdatetime", "order_date_time", "OrderDate", "orderdate", "order_date"],
  Operation: ["Operation", "operation"],
  State: ["State", "state", "Status", "status"],
};

/** Находит первую существующую колонку из кандидатов (с учётом регистра) */
function resolveColumn(columnNames, candidates) {
  for (const cand of candidates) {
    if (columnNames.has(cand)) return cand;
  }
  const lowerMap = new Map([...columnNames].map((c) => [c.toLowerCase(), c]));
  for (const cand of candidates) {
    const found = lowerMap.get(cand.toLowerCase());
    if (found) return found;
  }
  return null;
}

/** Список колонок для SELECT и фильтрации */
const OUTPUT_COLUMNS = ["OrderNum", "ClassCode", "SecCode", "Price", "Qty", "Value", "OrderDateTime", "Operation", "State"];
const ACTIVE_STATE = "Активна";

/**
 * GET /api/orders
 * Возвращает только активные заявки (State = "Активна") с полями:
 * OrderNum, ClassCode, SecCode, Price, Qty, Value, OrderDateTime, Operation, State.
 * Фильтрация по всем указанным столбцам через query-параметры.
 */
export async function getOrders(req, res, next) {
  try {
    const tableName = "Orders";

    const columnsResult = await pgPool.query(
      `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
      ORDER BY ordinal_position;
      `,
      [tableName]
    );

    if (columnsResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Таблица "${tableName}" не найдена в схеме public`,
      });
    }

    const columnNames = new Set(columnsResult.rows.map((row) => row.column_name));

    // Маппинг: выходное имя -> реальная колонка в БД
    const colMap = {};
    for (const outName of OUTPUT_COLUMNS) {
      const realCol = resolveColumn(columnNames, COLUMN_CANDIDATES[outName] || [outName]);
      if (realCol) colMap[outName] = realCol;
    }

    const stateCol = colMap.State;
    if (!stateCol) {
      return res.status(400).json({
        error: "Не найдена колонка State в таблице Orders",
      });
    }

    const conditions = [`"${stateCol}" = $1`];
    const params = [ACTIVE_STATE];
    let paramIndex = 2;

    // Фильтры по всем столбцам (кроме State — он зафиксирован)
    const filterColumns = OUTPUT_COLUMNS.filter((c) => c !== "State");
    for (const outName of filterColumns) {
      const value = req.query[outName];
      if (value == null || value === "") continue;

      const realCol = colMap[outName];
      if (!realCol) continue;

      params.push(value);
      conditions.push(`"${realCol}" = $${paramIndex++}`);
    }

    const whereClause = ` WHERE ${conditions.join(" AND ")}`;
    const selectParts = Object.entries(colMap).map(([out, real]) => `"${real}" AS "${out}"`);
    const orderBy = colMap.OrderDateTime
      ? `"${colMap.OrderDateTime}" DESC NULLS LAST`
      : colMap.OrderNum
        ? `"${colMap.OrderNum}" ASC`
        : "";
    const orderClause = orderBy ? ` ORDER BY ${orderBy}` : "";

    const query = `
      SELECT ${selectParts.join(", ")}
      FROM public."${tableName}"${whereClause}${orderClause}
    `;

    const result = await pgPool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}
