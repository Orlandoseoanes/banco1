const router =require("express").Router()
const bcrypt = require('bcrypt');
const modelosUsuario=require('../app/models/modeloUser')
const jwt = require('jsonwebtoken'); // Importa la biblioteca jsonwebtoken
const { Router } = require("express");


//REGISTRO USUARIO
router.post('/Usuario/Registro', async (req, res) => {
  const { cedula, nombre, apellido, usuario, contrasena } = req.body;

  // Validación para la Cédula
  if (!isValidCedula(cedula)) {
      return res.status(400).json({
          message: 'Cédula no válida. Debe ser un número entre 10000 y 9999999999.'
      });
  }

  // Validación para el Nombre
  if (!isValidNombre(nombre)) {
      return res.status(400).json({
          message: 'Nombre no válido. Debe tener entre 5 y 50 caracteres.'
      });
  }

  // Validación para el Apellido
  if (!isValidApellido(apellido)) {
      return res.status(400).json({
          message: 'Apellido no válido. Debe tener entre 5 y 50 caracteres.'
      });
  }

  // Validación para el Usuario
  if (!isValidUsuario(usuario)) {
      return res.status(400).json({
          message: 'Usuario no válido. Debe tener entre 5 y 50 caracteres.'
      });
  }

  // Validación para la Contraseña
  if (!isValidContrasena(contrasena)) {
      return res.status(400).json({
          message: 'Contraseña no válida. Debe tener entre 5 y 50 caracteres.'
      });
  }

 
  try {
      const newUsuario = await modelosUsuario.create({
          cedula,
          nombre,
          apellido,
          usuario,
          contrasena,
          numero_de_cuenta:generarNumeroDeCuenta(),
          saldo:1000,
          estado: 'offline' 
      });
      res.status(201).json({
          message: 'Usuario creado exitosamente',
          usuario: newUsuario,
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({
          message: 'Error al crear usuario',
          error,
      });
  }
});


//login
router.post('/login', async (req, res) => {
  const { usuario, contrasena } = req.body;

  // Validación de entradas
  if (!usuario || !contrasena ) {
    return res.status(400).json({
      message: 'Usuario, contraseña y clave dinámica son requeridos.',
    });
  }

  try {
    // Buscar el usuario por nombre de usuario
    const usuarioEncontrado = await modelosUsuario.findOne({
      where: { usuario: usuario },
    });

    if (!usuarioEncontrado) {
      return res.status(401).json({
        message: 'Usuario no encontrado.',
      });
    }

    // Verificar la contraseña
    const esValido = await usuarioEncontrado.comparePassword(contrasena);

    if (!esValido) {
      return res.status(401).json({
        message: 'Contraseña incorrecta.',
      });
    }

  

    // Generar token
    const payload = {
      cedula: usuarioEncontrado.cedula,
      nombre: usuarioEncontrado.nombre,
      apellido: usuarioEncontrado.apellido,
      usuario: usuarioEncontrado.usuario,
      numero_de_cuenta: usuarioEncontrado.numero_de_cuenta,
      saldo: usuarioEncontrado.saldo,
    };

    const token = jwt.sign(payload, 'clave', { expiresIn: '1h' });

    

    res.status(200).json({
      message: 'Inicio de sesión exitoso.',
      status: 200,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error al iniciar sesión.',
      error: error.message,
    });
  }
});


//generar numero de cuenta
function generarNumeroDeCuenta() {
    let numeroDeCuenta = '';
    for (let i = 0; i < 11; i++) {
        const digitoAleatorio = Math.floor(Math.random() * 10);
        numeroDeCuenta += digitoAleatorio;
    }
    return numeroDeCuenta;
}
// Función para validar la Cédula
function isValidCedula(cedula) {
  return Number.isInteger(cedula) && cedula >= 10000 && cedula <= 9999999999;
}

// Función para validar el Nombre
function isValidNombre(nombre) {
  return typeof nombre === 'string' && nombre.length >= 5 && nombre.length <= 50;
}

// Función para validar el Apellido
function isValidApellido(apellido) {
  return typeof apellido === 'string' && apellido.length >= 5 && apellido.length <= 50;
}

// Función para validar el Usuario
function isValidUsuario(usuario) {
  return typeof usuario === 'string' && usuario.length >= 5 && usuario.length <= 50;
}

// Función para validar la Contraseña
function isValidContrasena(contrasena) {
  return typeof contrasena === 'string' && contrasena.length >= 5 && contrasena.length <= 50;
}

module.exports=router;