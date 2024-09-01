const router =require("express").Router()
const { Router } = require("express");
const modeloclavedinamica=require('../app/models/modeloDinamica');
const Usuario = require("../app/models/modeloUser");

router.get('/generarClave/:cedula', async (req, res) => {
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
            where: { usuarioId: cedula }
        });

        // Guardar la clave dinámica en el modelo correspondiente
        await modeloclavedinamica.create({
            usuarioId: usuario.cedula,  // Asegúrate de que el campo `usuarioId` en `modeloclavedinamica` está relacionado con `cedula`
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



// Genera una clave dinámica (aquí podrías usar alguna librería o lógica específica)
const generarClaveDinamica = () => {
    // Lógica para generar clave dinámica, por ejemplo:
    return Math.floor(100000 + Math.random() * 999999); // Genera un número de 6 dígitos aleatorio
};

// Función para calcular la fecha de expiración (ejemplo: 5 minutos después)
const calcularFechaExpiracion = () => {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);
    return expiresAt;
};


module.exports=router;
