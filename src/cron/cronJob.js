import { CronJob } from "cron";
import { getInstruments } from "../services/instrumentsService.js";

const job = new CronJob(
  "*/500 * * * * *", // ← 6 звёздочек! теперь первая — это секунды
  async () => {
    console.log("🔍 Проверка новых инструментов...", new Date().toLocaleTimeString());
    const instruments = await getInstruments();
     for (const instrument of instruments) {
        // console.log(instrument);
    //   if (instrument.needs_coupon) {
    //     await addCoupon(instrument);
    //     console.log(`✅ Купон добавлен для инструмента ${instrument.name}`);
    //   }
     }
  },
  null,
  true,
  "Asia/Bishkek" // часовой пояс (по желанию)
);


export default job;