import { z } from "zod";

export const instrumentSchema = z.object({
  SecurityType: z.string().min(1, "Тип инструмента обязателен"),
  Broker: z.string().min(1, "Брокер обязателен"),
  ExtCode: z.string().min(1, "Код инструмента обязателен"),
  ShortName: z.string().min(1, "Короткое имя обязательно"),
  NameRus: z.string().min(1, "Русское название обязательно"),
  Nominal: z.number().positive("Номинал должен быть больше 0"),
  Currency: z.string().min(1, "Валюта обязательна"),
  LotSize: z.number().int().positive("Размер лота должен быть положительным"),
  PriceStep: z.number().min(0),
  Active: z.number().int().min(0).max(1),
  Settlement: z.string().min(1, "Тип расчёта обязателен"),
});
