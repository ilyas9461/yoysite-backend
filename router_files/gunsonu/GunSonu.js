const express = require('express');
const app = express();
const gunSonuRoute = express.Router();
//const configMySql = require(__dirname + "/public/js/mysql-config.js");
const mysqlIslem = require("../../public/js/mysql_classes.js"); //__dirname + 
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
var VerifyToken = require('../../auth/VerifyToken');
const firmaDizi=require('../../public/js/functionLys');

gunSonuRoute.post("/", async function (req, res) { // '/gunsonu' isteği bu root için kök.

    let firma=firmaDizi.olustur( req.body.user);

    console.log('firma:'+firma+ ' Uz:'+firma.length);
     //console.log("gun sonu kok: %j", req.body);
    //console.log(firma,req.body.tar1,req.body.tar2);

    let results = [];
    for (let i = 0; i < firma.length; i++) {
        try {
            let data = await mysqlIslem.getGunSonu(
                firma[i],
                req.body.tar1,
                req.body.tar2
            );
    
            results[i] = data;
            
        } catch (error) {
            console.log("Hata", error);
        }
        
    }
    console.log(JSON.stringify(results));

    //res.json(JSON.stringify(results[0]));
    res.json(JSON.stringify(results));
    res.end();
});

gunSonuRoute.post("/tarihliliste", async function (req, res) { 
   //console.log("/tarihliliste: %j", req.body);

    let results= await mysqlIslem.tarihliListeler(req.body);

   console.log(JSON.stringify(results));

   // res.json(JSON.stringify(results[0]));
    res.json(JSON.stringify(results));
    res.end();

});


gunSonuRoute.post("/songunsonu", VerifyToken, async function (req, res) { //VerifyToken,
    //console.log('/songunsonu:', JSON.parse(req.headers.token));

    let firma=firmaDizi.olustur( req.body.user);

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
    //console.log('results : ',results);

    res.json(JSON.stringify(results));
    res.end();
});

gunSonuRoute.post("/gunlukcirodetay", VerifyToken, async function (req, res) { //VerifyToken,

    let firma = Number(req.body.user);
    let tarih = req.body.tar.split(' ')[0];
    // console.log(firma, tarih);

    let results = await mysqlIslem.getSonGunSonuCiroAyrinti(firma, tarih);
    console.log("Ayrinti detay: ",results);

    res.json(results);
    res.end();
});

gunSonuRoute.post("/gunlukmasrafdetay", VerifyToken, async function (req, res) { //VerifyToken,

    let firma = Number(req.body.user);
    let tarih = req.body.tar.split(' ')[0];
    //console.log(firma, tarih);
    let results = await mysqlIslem.getSonGunSonuMasraf(firma, tarih);

   // console.log("gunsonu masraf detay: ",results);

    res.json(results);
    res.end();

});

gunSonuRoute.post("/gunlukbankadetay", VerifyToken, async function (req, res) { //VerifyToken,

    let firma = Number(req.body.user);
    let tarih = req.body.tar.split(' ')[0];
   // console.log(firma, tarih);
    let results = await mysqlIslem.getSonGunSonuBanka(firma, tarih);
    // console.log("gunluk banka detay: ", results);

    res.json(results);
    res.end();

});



module.exports = gunSonuRoute;