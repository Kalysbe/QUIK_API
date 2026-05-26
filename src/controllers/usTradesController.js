// src/controllers/usTradesController.js
import pgPool from "../config/dbPostgres.js";

const TABLE_NAME = "UsTrades";
const RESERVED_QUERY_PARAMS = new Set(["limit"]);

/**
 * GET /api/us-trades
 * Сделки для исполнения из таблицы UsTrades.
 * Фильтрация по любому столбцу через query-параметры (имя = колонка в БД).
 */
export async function getUsTrades(req, res, next) {
  try {
    const columnsResult = await pgPool.query(
      `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
      ORDER BY ordinal_position;
      `,
      [TABLE_NAME]
    );

    if (columnsResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Таблица "${TABLE_NAME}" не найдена в схеме public`,
      });
    }

    const columnNames = new Set(columnsResult.rows.map((row) => row.column_name));
    const conditions = [];
    const params = [];

    for (const [key, value] of Object.entries(req.query)) {
      if (RESERVED_QUERY_PARAMS.has(key)) continue;
      if (!columnNames.has(key)) continue;
      if (value == null || value === "") continue;

      params.push(value);
      conditions.push(`"${key}" = $${params.length}`);
    }

    const whereClause = conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "";

    let limitClause = "";
    const { limit } = req.query;
    if (limit && /^\d+$/.test(String(limit))) {
      const limitValue = Math.min(parseInt(String(limit), 10), 100000);
      limitClause = ` LIMIT ${limitValue}`;
    }

    const query = `SELECT * FROM public."${TABLE_NAME}"${whereClause}${limitClause}`;
    const result = await pgPool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}
