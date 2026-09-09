import logger from "../utils/logger.js";
import { fetchActiveOrders } from "./ordersService.js";

const DEFAULT_URL = "http://192.168.0.38/cron/quik_ingest.php";
const DEFAULT_TOKEN = "kse_quik_2026_R8nK4wP2mQ7xL1vB";

function ingestConfig() {
  const enabled = String(process.env.KSE_INGEST_ENABLED || "true").toLowerCase() !== "false";
  return {
    enabled,
    url: process.env.KSE_INGEST_URL || DEFAULT_URL,
    token: process.env.KSE_INGEST_TOKEN || DEFAULT_TOKEN,
  };
}

function serializeItem(row) {
  const item = {};
  for (const [key, value] of Object.entries(row)) {
    if (value == null) {
      item[key] = "";
    } else if (value instanceof Date) {
      item[key] = value.toISOString();
    } else {
      item[key] = String(value);
    }
  }
  return item;
}

export async function pushActiveOrdersToKse() {
  const { enabled, url, token } = ingestConfig();
  if (!enabled) {
    return { skipped: true };
  }

  const rows = await fetchActiveOrders();
  const items = rows.map(serializeItem);
  const payload = JSON.stringify({
    resource: "orders",
    replace: true,
    items,
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Accept: "application/json",
      "X-Quik-Token": token,
    },
    body: payload,
    signal: AbortSignal.timeout(30000),
  });

  const body = await response.text();
  let parsed = body;
  try {
    parsed = JSON.parse(body);
  } catch {
    // оставляем текст
  }

  if (!response.ok) {
    logger.error("KSE ingest failed", {
      status: response.status,
      url,
      rows: items.length,
      body: parsed,
    });
    const err = new Error(`KSE ingest HTTP ${response.status}`);
    err.details = parsed;
    throw err;
  }

  logger.info("KSE ingest ok", { url, rows: items.length, response: parsed });
  return parsed;
}
