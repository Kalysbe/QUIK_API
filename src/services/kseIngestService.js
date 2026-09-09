import logger from "../utils/logger.js";
import { fetchActiveOrders } from "./ordersService.js";

const PUBLIC_URL = "https://www.kse.kg/cron/quik_ingest.php";
const DEFAULT_TOKEN = "kse_quik_2026_R8nK4wP2mQ7xL1vB";

function ingestConfig() {
  const enabled = String(process.env.KSE_INGEST_ENABLED || "true").toLowerCase() !== "false";
  return {
    enabled,
    url: process.env.KSE_INGEST_URL || PUBLIC_URL,
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

function errorDetails(err) {
  const cause = err.cause || {};
  return {
    error: err.message,
    cause: cause.message || cause.code || undefined,
    code: cause.code,
    address: cause.address,
    port: cause.port,
  };
}

async function postIngest(url, token, payload) {
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
    const err = new Error(`KSE ingest HTTP ${response.status}`);
    err.details = { status: response.status, url, body: parsed };
    throw err;
  }

  return parsed;
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

  const urls = [url];
  if (url !== PUBLIC_URL) {
    urls.push(PUBLIC_URL);
  }

  let lastError;
  for (const target of urls) {
    try {
      const parsed = await postIngest(target, token, payload);
      logger.info("KSE ingest ok", { url: target, rows: items.length, response: parsed });
      return parsed;
    } catch (err) {
      lastError = err;
      logger.warn("KSE ingest attempt failed", {
        url: target,
        rows: items.length,
        ...errorDetails(err),
        details: err.details,
      });
    }
  }

  throw lastError;
}
