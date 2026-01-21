// src/controllers/tradesController.js
import pgPool from "../config/dbPostgres.js";

/* =========================
   GET /trades
   Фильтрация по любому столбцу через query параметры
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

    let filtersFromParam = {};
    if (req.query.filters !== undefined) {
      if (typeof req.query.filters === "string") {
        try {
          const parsed = JSON.parse(req.query.filters);
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            filtersFromParam = parsed;
          } else {
            return res.status(400).json({
              success: false,
              message: "Параметр filters должен быть объектом или JSON-строкой объекта",
            });
          }
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: "Не удалось распарсить JSON в параметре filters",
          });
        }
      } else if (typeof req.query.filters === "object") {
        filtersFromParam = req.query.filters;
      } else {
        return res.status(400).json({
          success: false,
          message: "Параметр filters должен быть объектом или JSON-строкой объекта",
        });
      }
    }

    const directFilters = { ...req.query };
    delete directFilters.filters;

    const combinedFilters = { ...directFilters, ...filtersFromParam };

    const conditions = [];
    const params = [];

    for (const [key, value] of Object.entries(combinedFilters)) {
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

