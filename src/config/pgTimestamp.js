import pg from "pg";

/** timestamp without time zone → DD-MM-YYYY, без сдвига в UTC при JSON. */
function formatTimestampDdMmYyyy(value) {
  if (value == null) return value;
  const datePart = String(value).trim().split(/[ T]/)[0];
  const match = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return value;
  const [, yyyy, mm, dd] = match;
  return `${dd}-${mm}-${yyyy}`;
}

pg.types.setTypeParser(pg.types.builtins.TIMESTAMP, formatTimestampDdMmYyyy);
