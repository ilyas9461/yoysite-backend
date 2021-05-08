const express = require('express');
const app = express();
const gunlukRoute = express.Router();
//const configMySql = require(__dirname + "/public/js/mysql-config.js");
const mysqlIslem = require("../../public/js/mysql_classes.js"); //__dirname + 
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
var VerifyToken = require('../../auth/VerifyToken');

gunlukRoute.post("/", async function (req, res) {

});


module.exports = gunlukRoute;