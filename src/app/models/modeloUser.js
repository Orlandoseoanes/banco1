const { Model, DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");

const sequelize = require("../conexion");

const Usuario = sequelize.define(
  "Usuarios",
  {
    cedula: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
    },
    nombre: {
      type: DataTypes.STRING,
    },
    apellido: {
      type: DataTypes.STRING,
    },
    numero_de_cuenta :{
        type: DataTypes.BIGINT,
        allowNull: false,
        unique:true
    },
    saldo:{
        type: DataTypes.DECIMAL(10,2)

    } ,
    usuario: {
      type: DataTypes.STRING,
      unique: true,
    },
    contrasena: {
      type: DataTypes.STRING,
    },
    estado: {
      type: DataTypes.ENUM("offline", "online"),
      defaultValue: "offline", // Por defecto el usuario está "offline"
    },
   
  },
  {
    hooks: {
      beforeCreate: async (usuario) => {
        // Hash de la contraseña solo si se proporciona
        if (usuario.contrasena) {
          usuario.contrasena = await bcrypt.hash(usuario.contrasena, 10);
        }
      },
    },
    sequelize,
    modelName: "Usuario",
    createdAt: false,
    updatedAt: false,
  }
);

Usuario.prototype.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.contrasena);
};

module.exports = Usuario;
