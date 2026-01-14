import { CronJob } from "cron";

const job = new CronJob(
  "*/5 * * * * *", // ← 6 звёздочек! теперь первая — это секунды
  async () => {
    console.log("🔍 Проверка новых инструментов...", new Date().toLocaleTimeString());
    // const instruments = await getInstruments();
    // for (const instrument of instruments) {
    //   if (instrument.needs_coupon) {
    //     await addCoupon(instrument);
    //     console.log(`✅ Купон добавлен для инструмента ${instrument.name}`);
    //   }
    // }
  },
  null,
  true,
  "Asia/Bishkek" // часовой пояс (по желанию)
);
job.start();

export default job;