// src/models/Security.js
import { DataTypes } from "sequelize";
import { pgSequelize } from "../config/sequelize.js";

const Security = pgSequelize.define(
  "Securities",
  {
    ClassCode: { type: DataTypes.STRING, primaryKey: true }, // например, это уникальный код
    SecCode: { type: DataTypes.STRING },
  },
  {
    timestamps: false,   // не добавлять createdAt/updatedAt
    freezeTableName: true, // не менять имя таблицы
    createdAt: false,
    updatedAt: false,
    id: false,           // <--- чтобы не создавал поле id
  }
);

export default Security;
