// src/controllers/trdaccController.js
import Trdacc from "../models/Trdacc.js";
import { filterRowsForAccess } from "../services/depositoryAccess.js";

/* =========================
   GET /trdaccs
   Фильтрация по FirmId через query параметр
   ========================= */
export async function getTrdaccs(req, res, next) {
  try {
    const { FirmId } = req.query;
    
    const whereClause = {};
    if (FirmId) {
      whereClause.FirmId = FirmId;
    }

    const trdaccs = await Trdacc.findAll({
      where: whereClause,
      raw: true, // Возвращает все столбцы как сырые данные
      order: [["FirmId", "ASC"]],
    });
    
    // Депозитарий видит только свои счета (те же правила, что для DepoLimits.Trdacc).
    res.json(filterRowsForAccess(req.access, trdaccs, "depo_account", "TrdAccId"));
  } catch (err) {
    next(err);
  }
}

