import { CronJob } from "cron";
import logger from "../utils/logger.js";
import { pushActiveOrdersToKse } from "../services/kseIngestService.js";

let job = null;
let running = false;

async function tick() {
  if (running) {
    return;
  }
  running = true;
  try {
    await pushActiveOrdersToKse();
  } catch (err) {
    logger.error("KSE orders push job error", {
      error: err.message,
      cause: err.cause?.message || err.cause?.code,
      code: err.cause?.code,
      details: err.details,
    });
  } finally {
    running = false;
  }
}

export function startKseOrdersPushJob() {
  if (String(process.env.KSE_INGEST_ENABLED || "true").toLowerCase() === "false") {
    logger.info("KSE orders push job disabled");
    return;
  }

  if (job) {
    return;
  }

  const cronTime = process.env.KSE_INGEST_CRON || "0 */1 * * * *";
  job = new CronJob(cronTime, tick, null, false, "Asia/Bishkek");
  job.start();
  logger.info("KSE orders push job started", { cronTime });
  tick().catch(() => {});
}

export function stopKseOrdersPushJob() {
  if (!job) {
    return;
  }
  job.stop();
  job = null;
  logger.info("KSE orders push job stopped");
}
