const config = require("../config");
const express = require('express');
const morgan = require('morgan');
const app = express();


var createError = require('http-errors');
const cors = require('cors');
var path = require('path');
/////////
const routerUser =require ('../router/routerUsuario');
const routerDinamica=require("../router/routerDinamico");
const routerCajero=require("../router/routerCajero");

/////

app.use(morgan("dev"));
app.get('/', (req, res) => {
    res.send('express');
});
app.use(express.json());
app.use('/MEDIA', express.static(path.join(__dirname, 'MEDIA')));
app.use(cors(config.application.cors.server));


app.use("/API/V2", routerUser); 
app.use("/API/V2", routerDinamica); 
app.use("/API/V2", routerCajero); 




module.exports = app;
