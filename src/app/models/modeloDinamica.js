const { Model, DataTypes } = require("sequelize");
const sequelize = require("../conexion");

const ClaveDinamicas = sequelize.define(
  "ClaveDinamicas",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    usuarioId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'Usuario', 
        key: 'cedula',
      },
    },
    clave: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "ClaveDinamica",
    updatedAt: false,
  }
);

module.exports = ClaveDinamicas;
