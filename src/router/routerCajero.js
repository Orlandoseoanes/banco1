const router = require("express").Router();
const { Router } = require("express");
const modeloclavedinamica = require("../app/models/modeloDinamica");
const modelousuario = require("../app/models/modeloUser");
const ClaveDinamicas = require("../app/models/modeloDinamica");
//fase 1: valida que cuenta exista en nequi o bancolombia
router.get("/cajero/:tipobanco/:cuenta", async (req, res) => {
  try {
    const { tipobanco, cuenta } = req.params;

    const user = await modelousuario.findOne({
      where: { numero_de_cuenta: cuenta },
    });

    if (!user) {
      return res.status(404).json({ message: "Cuenta no existe" });
    }

    if (tipobanco === "bancolombia") {
      if (user.numero_de_cuenta[0] === "0") {
        return res
          .status(404)
          .json({ message: "Cuenta no asociada a Bancolombia" });
      } else {
        return res.status(200).json({ message: "Cuenta válida" });
      }
    } else if (tipobanco === "nequi") {
      if (user.numero_de_cuenta[0] === "0") {
        return res.status(404).json({ message: "Cuenta no asociada a Nequi" });
      } else {
        return res.status(200).json({ message: "Cuenta válida" });
      }
    } else {
      return res.status(400).json({ message: "Tipo de banco no válido" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//fase 2: valida que la clave sea la correcta
router.get("/cajero/validacion/:cuenta/:contrasena", async (req, res) => {
  try {
    const { cuenta, contrasena } = req.params;

    if (!cuenta || !contrasena) {
      return res.status(400).json({
        message: "cuenta, contraseña y clave dinámica son requeridos.",
      });
    }

    const user = await modelousuario.findOne({
      where: { numero_de_cuenta: cuenta },
    });

    const esValido = await user.comparePassword(contrasena);

    if (!user) {
      return res.status(404).json({ message: "Cuenta no existe" });
    }

    if (!esValido) {
      return res.status(401).json({
        message: "Contraseña incorrecta.",
      });
    } else {
      return res.status(200).json({ message: "ok" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//fase 3: validacion fondos insuficientes y retiro
router.get("/cajero/retiro/:cuenta/:Cantidad_a_retirar/:dinamica",async (req, res) => {
    try {
      const { cuenta, dinamica } = req.params;
      const cantidadRetirar = parseInt(req.params.Cantidad_a_retirar, 10); // Convertir a número entero

      const user = await modelousuario.findOne({
        where: {
          numero_de_cuenta: cuenta,
        },
      });

      if (!user) {
        return res.status(404).json({ message: "Cuenta no existe" });
      }

      if (cantidadRetirar > user.saldo) {
        return res.status(401).json({ message: "Fondos insuficientes" });
      }

      const clavedinamica = await ClaveDinamicas.findOne({
        where: { usuarioId: user.cedula },
      });

      if (!clavedinamica) {
        return res.status(404).json({ message: "Clave dinámica no encontrada" });
      }

      if (dinamica !== clavedinamica.clave) {
        return res.status(401).json({ message: "Clave dinámica incorrecta" });
      }

      if (clavedinamica.expiresAt < Date.now()) {
        return res.status(401).json({ message: "Clave expirada" });
      }

      // Repartir billetes y actualizar saldo
      const billetesRepartidos = repartirBilletes(cantidadRetirar);
      user.saldo = user.saldo - cantidadRetirar;
      await user.save();

      const contadorBilletes = contarBilletes(billetesRepartidos);

      return res.status(200).json({
        message: "Retiro exitoso",
        billetes: billetesRepartidos,
        contadorBilletes,
        saldo: user.saldo,
      });

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

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

module.exports = router;
