import pgPool from "../config/dbPostgres.js";

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

const OUTPUT_COLUMNS = ["OrderNum", "ClassCode", "SecCode", "Price", "Qty", "Value", "OrderDateTime", "Operation", "State"];
const ACTIVE_STATE = "Активна";

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

export async function fetchActiveOrders(filters = {}) {
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
    const err = new Error(`Таблица "${tableName}" не найдена в схеме public`);
    err.status = 404;
    throw err;
  }

  const columnNames = new Set(columnsResult.rows.map((row) => row.column_name));
  const colMap = {};
  for (const outName of OUTPUT_COLUMNS) {
    const realCol = resolveColumn(columnNames, COLUMN_CANDIDATES[outName] || [outName]);
    if (realCol) colMap[outName] = realCol;
  }

  const stateCol = colMap.State;
  if (!stateCol) {
    const err = new Error("Не найдена колонка State в таблице Orders");
    err.status = 400;
    throw err;
  }

  const conditions = [`"${stateCol}" = $1`];
  const params = [ACTIVE_STATE];
  let paramIndex = 2;

  for (const outName of OUTPUT_COLUMNS.filter((c) => c !== "State")) {
    const value = filters[outName];
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

  const result = await pgPool.query(
    `
    SELECT ${selectParts.join(", ")}
    FROM public."${tableName}"${whereClause}${orderClause}
    `,
    params
  );

  return result.rows;
}
