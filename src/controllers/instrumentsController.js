import Security from "../models/Security.js";

export async function getInstruments() {
  try {
    const securities = await Security.findAll();
    return securities;
  } catch (err) {
    console.error("Ошибка при получении данных:", err.message);
    return res.status(500).json({ error: "Не удалось получить данные" });
  }
}
