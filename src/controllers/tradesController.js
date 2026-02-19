// src/controllers/tradesController.js
import pgPool from "../config/dbPostgres.js";

/** Кандидаты имён колонок для маппинга (в порядке приоритета) */
const COLUMN_CANDIDATES = {
  TradeNum: ["TradeNum", "tradenum", "trade_num"],
  ClassCode: ["ClassCode", "classcode", "class_code"],
  TradeDate: ["TradeDate", "tradedate", "trade_date"],
  Price: ["Price", "price"],
  Qty: ["Qty", "qty", "Quantity", "quantity"],
  Value: ["Value", "value", "Amount", "amount"],
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

/* =========================
   GET /api/trades/aggregated
   Агрегированные сделки: 1 trade = 1 запись (для временного ряда цен)
   ========================= */
export async function getAggregatedTrades(req, res, next) {
  try {
    const tableName = "Trades";
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

    const columnNames = new Set(columnsResult.rows.map((row) => row.column_name));

    const tradeNum = resolveColumn(columnNames, COLUMN_CANDIDATES.TradeNum);
    const classCode = resolveColumn(columnNames, COLUMN_CANDIDATES.ClassCode);
    const tradeDate = resolveColumn(columnNames, COLUMN_CANDIDATES.TradeDate);
    const price = resolveColumn(columnNames, COLUMN_CANDIDATES.Price);
    const qty = resolveColumn(columnNames, COLUMN_CANDIDATES.Qty);
    const valueCol = resolveColumn(columnNames, COLUMN_CANDIDATES.Value);

    const required = [
      ["TradeNum", tradeNum],
      ["ClassCode", classCode],
      ["TradeDate", tradeDate],
      ["Price", price],
      ["Qty", qty],
    ];
    const missing = required.filter(([, col]) => !col).map(([name]) => name);
    if (missing.length > 0) {
      return res.status(400).json({
        error: "Не найдены обязательные колонки в таблице Trades",
        missing,
      });
    }

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    const { ClassCode, SecCode, from, to, limit } = req.query;

    if (ClassCode) {
      params.push(ClassCode);
      conditions.push(`"${classCode}" = $${paramIndex++}`);
    }
    const secCodeCol = resolveColumn(columnNames, ["SecCode", "seccode", "sec_code"]);
    if (SecCode && secCodeCol) {
      params.push(SecCode);
      conditions.push(`"${secCodeCol}" = $${paramIndex++}`);
    }
    if (from) {
      params.push(from);
      conditions.push(`"${tradeDate}" >= $${paramIndex++}::timestamptz`);
    }
    if (to) {
      params.push(to);
      conditions.push(`"${tradeDate}" <= $${paramIndex++}::timestamptz`);
    }

    const whereClause = conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "";
    const limitClause = limit && /^\d+$/.test(limit) ? ` LIMIT ${Math.min(parseInt(limit, 10), 100000)}` : " LIMIT 10000";
    const valueExpr = valueCol
      ? `COALESCE(MAX("${valueCol}"), MAX("${price}") * MAX("${qty}"))`
      : `MAX("${price}") * MAX("${qty}")`;
    const secCodeExpr = secCodeCol
      ? `MAX("${secCodeCol}") AS "SecCode"`
      : `"${classCode}" AS "SecCode"`;

    const query = `
      SELECT
        "${classCode}" AS "ClassCode",
        ${secCodeExpr},
        MAX("${price}") AS "Price",
        MAX("${qty}") AS "Qty",
        ${valueExpr} AS "Value",
        MAX("${tradeDate}") AS "TradeDateTime"
      FROM public."${tableName}"${whereClause}
      GROUP BY "${tradeNum}", "${classCode}", "${tradeDate}"
      ORDER BY "TradeDateTime" ASC${limitClause}
    `;

    const result = await pgPool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

/* =========================
   GET /api/trades/sec-codes
   Список уникальных SecCode в таблице Trades
   ========================= */
export async function getTradesSecCodes(req, res, next) {
  try {
    const tableName = "Trades";
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

    const columnNames = new Set(columnsResult.rows.map((row) => row.column_name));
    const classCode = resolveColumn(columnNames, COLUMN_CANDIDATES.ClassCode);
    const secCodeCol = resolveColumn(columnNames, ["SecCode", "seccode", "sec_code"]);

    const sourceCol = secCodeCol ?? classCode;
    if (!sourceCol) {
      return res.status(400).json({
        error: "Не найдены колонки ClassCode или SecCode в таблице Trades",
      });
    }

    const query = `
      SELECT DISTINCT "${sourceCol}" AS "SecCode"
      FROM public."${tableName}"
      WHERE "${sourceCol}" IS NOT NULL
      ORDER BY "SecCode" ASC
    `;

    const result = await pgPool.query(query);
    res.json(result.rows.map((row) => row.SecCode));
  } catch (err) {
    next(err);
  }
}

/* =========================
   GET /api/trades
   Фильтрация по любому столбцу через query параметры. Пример: GET /api/trades?FirmId=ABC&SecCode=GAZP
   ========================= */
export async function getTrades(req, res, next) {
  try {
    const tableName = "Trades";

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

    const columnNames = new Set(columnsResult.rows.map((row) => row.column_name));
    const filters = { ...req.query };

    const conditions = [];
    const params = [];

    for (const [key, value] of Object.entries(filters)) {
      if (!columnNames.has(key)) continue;
      params.push(value);
      conditions.push(`"${key}" = $${params.length}`);
    }

    const whereClause = conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "";
    const query = `SELECT * FROM public."${tableName}"${whereClause}`;

    const result = await pgPool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

