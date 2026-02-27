import pgPool from "../config/dbPostgres.js";

function buildFilters(query) {
  const where = [];
  const params = [];

  if (query.from) {
    params.push(query.from);
    where.push(`"timestamp" >= $${params.length}`);
  }

  if (query.to) {
    params.push(query.to);
    where.push(`"timestamp" <= $${params.length}`);
  }

  if (query.userId) {
    params.push(query.userId);
    where.push(`user_id = $${params.length}`);
  }

  if (query.statusCode) {
    params.push(Number(query.statusCode));
    where.push(`status_code = $${params.length}`);
  }

  if (query.method) {
    params.push(query.method);
    where.push(`method = $${params.length}`);
  }

  if (query.route) {
    params.push(query.route);
    where.push(`route = $${params.length}`);
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return { whereClause, params };
}

export async function getLogs(req, res, next) {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 1000);
    const offset = Number(req.query.offset) || 0;

    const { whereClause, params } = buildFilters(req.query);

    const query = `
      SELECT *
      FROM api_logs
      ${whereClause}
      ORDER BY "timestamp" DESC
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
    `;

    const result = await pgPool.query(query, [...params, limit, offset]);

    res.json({
      success: true,
      data: result.rows,
      pagination: { limit, offset, count: result.rowCount }
    });
  } catch (error) {
    next(error);
  }
}

export async function exportLogsCsv(req, res, next) {
  try {
    const { whereClause, params } = buildFilters(req.query);

    const query = `
      SELECT
        request_id,
        "timestamp",
        method,
        url,
        route,
        status_code,
        response_time_ms,
        user_id,
        role,
        ip_address,
        level
      FROM api_logs
      ${whereClause}
      ORDER BY "timestamp" DESC
      LIMIT 10000
    `;

    const result = await pgPool.query(query, params);

    const header = [
      "request_id",
      "timestamp",
      "method",
      "url",
      "route",
      "status_code",
      "response_time_ms",
      "user_id",
      "role",
      "ip_address",
      "level"
    ];

    const lines = [header.join(",")];

    for (const row of result.rows) {
      const line = header
        .map((key) => {
          const value = row[key];
          if (value === null || value === undefined) return "";
          const str = String(value);
          const escaped = str.replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",");
      lines.push(line);
    }

    const csv = lines.join("\n");
    const date = new Date().toISOString().slice(0, 10);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="api-logs-${date}.csv"`
    );

    res.send(csv);
  } catch (error) {
    next(error);
  }
}

