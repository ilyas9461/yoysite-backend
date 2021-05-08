const express = require('express');
const app = express();
const gunSonuRoute = express.Router();
//const configMySql = require(__dirname + "/public/js/mysql-config.js");
const mysqlIslem = require("../../public/js/mysql_classes.js"); //__dirname + 
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
var VerifyToken = require('../../auth/VerifyToken');

gunSonuRoute.post("/", async function (req, res) { // '/gunsonu' isteği bu root için kök.
    let firma = [];
    let ind = 0;

    if (req.body.user.length > 0) {
        for (let i = 0; i < req.body.user.length; i++) {
            let firmaId = Number(req.body.user.split(",")[i]); //46,8,.. kullanıcı firmaWebId eri
            if (!Number.isNaN(firmaId)) {
                firma[ind++] = firmaId;
            }
        }
    }
    // console.log('firma:'+firma+ ' Uz:'+firma.length);
    // console.log("gun sonu: %j", req.body);
    //console.log(firma,req.body.tar1,req.body.tar2);
    let results = [];
    for (let i = 0; i < firma.length; i++) {
        let data = await mysqlIslem.getGunSonu(
            firma[i],
            req.body.tar1,
            req.body.tar2
        );
        results[i] = data[0];
    }
    //console.log(JSON.stringify(results));
    res.json(JSON.stringify(results));
    res.end();
});

gunSonuRoute.post("/songunsonu", VerifyToken, async function (req, res) { //VerifyToken,
    let firma = [];
    let ind = 0;

    //console.log('/songunsonu:', JSON.parse(req.headers.token));

    if (req.body.user.length > 0) {
        for (let i = 0; i < req.body.user.length; i++) {
            let firmaId = Number(req.body.user.split(",")[i]); //46,8,.. kullanıcı firmaWebId eri
            if (!Number.isNaN(firmaId)) {
                firma[ind++] = firmaId;
            }
        }
    }
    // console.log('firma:'+firma+ ' Uz:'+firma.length);
    // console.log("gun sonu: %j", req.body);
    //console.log(firma,req.body.tar1,req.body.tar2);
    let results = [];
    for (let i = 0; i < firma.length; i++) {
        let data = await mysqlIslem.getSonGunSonu(firma[i]);
        let gunSonu=data.sonGunSonu[0];
        let anlik=data.anlikGunSonu;
        results[i] =  {
            sonGunSonu:gunSonu,
            anlikGunSonu:anlik
        };
       // console.log(gunSonu);

    }
    console.log('results : ',results);

    res.json(JSON.stringify(results));
    res.end();
});

gunSonuRoute.post("/gunlukcirodetay", VerifyToken, async function (req, res) { //VerifyToken,

    let firma = Number(req.body.user);
    let tarih = req.body.tar.split(' ')[0];
    // console.log(firma, tarih);

    let results = await mysqlIslem.getSonGunSonuCiroAyrinti(firma, tarih);
    //console.log("Ayrinti detay: ",results);

    res.json(results);
    res.end();
});

gunSonuRoute.post("/gunlukmasrafdetay", VerifyToken, async function (req, res) { //VerifyToken,

    let firma = Number(req.body.user);
    let tarih = req.body.tar.split(' ')[0];
    // console.log(firma, tarih);
    let results = await mysqlIslem.getSonGunSonuMasraf(firma, tarih);
    //console.log("gunluk masraf detay: ",results);

    res.json(results);
    res.end();

});

gunSonuRoute.post("/gunlukbankadetay", VerifyToken, async function (req, res) { //VerifyToken,

    let firma = Number(req.body.user);
    let tarih = req.body.tar.split(' ')[0];
    console.log(firma, tarih);
    let results = await mysqlIslem.getSonGunSonuBanka(firma, tarih);
    // console.log("gunluk banka detay: ", results);

    res.json(results);
    res.end();

});



module.exports = gunSonuRoute;