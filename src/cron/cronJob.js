import { CronJob } from "cron";
import { getInstruments } from "../services/instrumentsService.js";
import { cleanupOldLogs } from "../repositories/apiLogsRepository.js";

const job = new CronJob(
  "*/500 * * * * *", // ← 6 звёздочек! теперь первая — это секунды
  async () => {
    // Зарезервировано для логики работы с инструментами (ранее закомментировано)
    // Также выполняем регулярную очистку старых логов API (старше 12 месяцев)
    await cleanupOldLogs(12);
  },
  null,
  true,
  "Asia/Bishkek" // часовой пояс (по желанию)
);


export default job;