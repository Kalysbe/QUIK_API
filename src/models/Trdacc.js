// src/models/Trdacc.js
import { DataTypes } from "sequelize";
import { pgSequelize } from "../config/sequelize.js";

const Trdacc = pgSequelize.define(
  "Trdaccs",
  {
    TrdAccId: { type: DataTypes.STRING(12), primaryKey: true },
    Type: { type: DataTypes.STRING(64) },
    FirmId: { type: DataTypes.STRING(12) },
    LoadDate: { type: DataTypes.DATE },
    Description: { type: DataTypes.STRING(128) },
    BankAccId: { type: DataTypes.STRING(12) },
    Status: { type: DataTypes.INTEGER },
    DepAccId: { type: DataTypes.STRING(12) },
    TrdAccType: { type: DataTypes.STRING(64) },
    MainTrdAccId: { type: DataTypes.STRING(12) },
    FirmUse: { type: DataTypes.SMALLINT },
    FullCoveredSell: { type: DataTypes.SMALLINT },
    BankIdT0: { type: DataTypes.STRING(12) },
    BankIdTPlus: { type: DataTypes.STRING(12) },
    DepUnitId: { type: DataTypes.STRING(17) },
    Flags: { type: DataTypes.INTEGER },
  },
  {
    timestamps: false,
    freezeTableName: true,
    createdAt: false,
    updatedAt: false,
    id: false,
    hasPrimaryKey: true,
  }
);

export default Trdacc;

