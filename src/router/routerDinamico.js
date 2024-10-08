const router = require("express").Router();
const { Router } = require("express");
const modeloclavedinamica = require("../app/models/modeloDinamica");
const Usuario = require("../app/models/modeloUser");

router.get("/generarClave/:cedula", async (req, res) => {
  try {
    const { cedula } = req.params;

    // Buscar el usuario por cédula
    const usuario = await Usuario.findByPk(cedula);

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Generar la clave dinámica
    const claveDinamica = generarClaveDinamica();

    // Calcular la fecha de expiración de la clave
    const expiresAt = calcularFechaExpiracion();

    await modeloclavedinamica.destroy({
      where: { usuarioId: cedula },
    });

    // Guardar la clave dinámica en el modelo correspondiente
    await modeloclavedinamica.create({
      usuarioId: usuario.cedula, // Asegúrate de que el campo `usuarioId` en `modeloclavedinamica` está relacionado con `cedula`
      clave: claveDinamica,
      expiresAt: expiresAt,
      // Puedes agregar otros campos si es necesario
    });

    // Enviar la clave generada como respuesta
    res.status(200).json({ clave: claveDinamica, expiresAt });
  } catch (error) {
    console.error("Error al generar la clave dinámica:", error);
    res.status(500).json({ message: "Error al generar la clave dinámica" });
  }
});

router.get("/RetirarDinero/:cedula/:cantidadRetirar", async (req, res) => {
  try {
    const { cedula } = req.params;
    const cantidadRetirar = parseInt(req.params.cantidadRetirar, 10); // Convertir a número entero

    // Buscar el usuario por su clave primaria (cédula)
    const usuarioEncontrado = await Usuario.findByPk(cedula);

    if (!usuarioEncontrado) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const dinerodisponible = usuarioEncontrado.saldo;
    if (cantidadRetirar > dinerodisponible) {
      return res
        .status(400)
        .json({ message: "No hay suficiente dinero en la cuenta" });
    } else {
      const billetesRepartidos = repartirBilletes(cantidadRetirar);

      usuarioEncontrado.saldo = usuarioEncontrado.saldo - cantidadRetirar;
      await usuarioEncontrado.save();
      const contadorBilletes = contarBilletes(billetesRepartidos);

      return res.status(200).json({
        message: "Retiro exitoso",
        billetes: billetesRepartidos,
        contadorBilletes,
        saldo: usuarioEncontrado.saldo,
      });
    }
  } catch (error) {
    console.error("Error al retirar dinero:", error);
    res.status(500).json({ message: "Error al retirar dinero" });
  }
});

router.get("/Transferir/:numerocuentausuario/:cantidad/:numerodestinatario",async (req, res) => {
    try {
      const { numerocuentausuario, numerodestinatario } = req.params;
      const cantidad = parseInt(req.params.cantidad, 10); // Convertir a número entero

      const usuarioEncontrado = await Usuario.findOne({
        where: {
          numero_de_cuenta: numerocuentausuario,
        },
      });

      const destinatarioEncontrado = await Usuario.findOne({
        where: {
          numero_de_cuenta: numerodestinatario,
        },
      });

      if (usuarioEncontrado && destinatarioEncontrado) {
        if (cantidad > usuarioEncontrado.saldo) {
          return res
            .status(400)
            .json({ message: "No hay suficiente dinero en la cuenta" });
        } else {
          usuarioEncontrado.saldo =
            parseFloat(usuarioEncontrado.saldo) - cantidad;
          await usuarioEncontrado.save();

          destinatarioEncontrado.saldo =
            parseFloat(destinatarioEncontrado.saldo) + cantidad;
          await destinatarioEncontrado.save();

          // Registro detallado en la consola
          console.log("Saldo del destinatario:", destinatarioEncontrado.saldo);
          console.log("Datos del remitente:", usuarioEncontrado.toJSON());

          return res.status(200).json({
            message: "Transferencia exitosa",
            saldo: usuarioEncontrado.saldo,
            destinatario:
              destinatarioEncontrado.nombre +
              " " +
              destinatarioEncontrado.apellido,
          });
        }
      } else {
        return res
          .status(404)
          .json({ message: "Usuario no existe o destinatario no encontrado" });
      }
    } catch (e) {
      console.error("Error al transferir dinero:", e);
      res.status(500).json({ message: "Error al transferir dinero" });
    }
  }
);

//actualizar fondos

router.get("/actualizarfondos/:numero_de_cuenta", async (req, res) => {
  try {
    const { numero_de_cuenta } = req.params;
    const usuarioEncontrado = await Usuario.findOne({ where: { numero_de_cuenta: numero_de_cuenta } });

    if (!usuarioEncontrado) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    } else {
      return res.status(200).json({ saldo: usuarioEncontrado.saldo });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error del servidor" });
  }
});


//jailer retiro
router.get("/RetirarDinero/nequi/:cedula/:cantidadRetirar", async (req, res) => {
  try {
    const { cedula } = req.params;
    const cantidadRetirar = parseInt(req.params.cantidadRetirar, 10); // Convertir a número entero

    // Buscar el usuario por su clave primaria (cédula)
    const usuarioEncontrado = await Usuario.findByPk(cedula);

    if (!usuarioEncontrado) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const dinerodisponible = usuarioEncontrado.saldo;
    if (cantidadRetirar > dinerodisponible) {
      return res
        .status(400)
        .json({ message: "No hay suficiente dinero en la cuenta" });
    } else {
      const billetesRepartidos = repartirBilletesjailer(cantidadRetirar);

      usuarioEncontrado.saldo = usuarioEncontrado.saldo - cantidadRetirar;
      await usuarioEncontrado.save();
      const contadorBilletes = contarBilletes(billetesRepartidos);

      return res.status(200).json({
        message: "Retiro exitoso",
        billetes: billetesRepartidos,
        contadorBilletes,
        saldo: usuarioEncontrado.saldo,
      });
    }
  } catch (error) {
    console.error("Error al retirar dinero:", error);
    res.status(500).json({ message: "Error al retirar dinero" });
  }
});


//funcion jailer
function repartirBilletesjailer(cantidad) {
  const billetes = [10000, 20000, 50000, 100000];
  let suma = 0;
  let billetesRepartidos = [];

  for (let vuelta = 0; suma < cantidad; vuelta++) {
    for (let i = 0; i < billetes.length && suma < cantidad; i++) {
      let indiceActual = (i + vuelta) % billetes.length;

      if (suma + billetes[indiceActual] <= cantidad) {
        suma += billetes[indiceActual];
        billetesRepartidos.push(billetes[indiceActual]);
      }
    }
  }

  return billetesRepartidos;
}



//funcion mia
function repartirBilletes(cantidad) {
  const billetes = [10000, 20000, 50000, 100000];
  let suma = 0;
  let i = 0;
  let vuelta = 0;
  let billetesRepartidos = [];

  while (suma < cantidad) {
    let indiceActual = (i + vuelta) % billetes.length;

    if (suma + billetes[indiceActual] <= cantidad) {
      suma += billetes[indiceActual];
      billetesRepartidos.push(billetes[indiceActual]);
    }
    i++;

    if (i === billetes.length) {
      i = 0;
      vuelta++;
    }
  }

  return billetesRepartidos;
}

function contarBilletes(billetes) {
  const contadorBilletes = {
    100000: 0,
    50000: 0,
    20000: 0,
    10000: 0,
  };

  billetes.forEach((billete) => {
    if (contadorBilletes[billete] !== undefined) {
      contadorBilletes[billete]++;
    }
  });

  return contadorBilletes;
}

const generarClaveDinamica = () => {
  return Math.floor(100000 + Math.random() * 999999);
};

const calcularFechaExpiracion = () => {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 5);
  return expiresAt;
};

module.exports = router;
