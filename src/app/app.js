const config = require("../config");
const express = require('express');
const morgan = require('morgan');
const app = express();


var createError = require('http-errors');
const cors = require('cors');
var path = require('path');
/////////
const routerUser =require ('../router/routerUsuario');
const routerDinamica=require("../router/routerDinamico")

/////
app.use(morgan("dev"));
app.get('/', (req, res) => {
    res.send('express');
});
app.use(express.json());
app.use('/MEDIA', express.static(path.join(__dirname, 'MEDIA')));
app.use(cors(config.application.cors.server));


app.use("/API/V2", routerUser); // Corrected mounting paths
app.use("/API/V2", routerDinamica); // Corrected mounting paths




module.exports = app;
