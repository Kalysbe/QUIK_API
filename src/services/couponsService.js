import { sql } from "../config/dbMssql.js";

export async function addCoupon(instrument) {
    console.log(instrument)
//   const pool = await getMssqlPool();
//   const request = new sql.Request(pool);

//   // Вызов хранимой процедуры
//   request.input("InstrumentId", sql.Int, instrument.id);
//   request.input("CouponRate", sql.Decimal(10, 2), instrument.rate);
//   request.input("StartDate", sql.Date, instrument.start_date);

//   await request.execute("sp_AddCoupon");
}
