// src/controllers/tradesController.js
import pgPool from "../config/dbPostgres.js";

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

