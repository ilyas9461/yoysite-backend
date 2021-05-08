/* Gereklilikler*/
const mysql = require("mysql");
const configMySql = require(__dirname + "/public/js/mysql-config.js");
const mysqlIslem = require(__dirname + "/public/js/mysql_classes.js");

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
//const session = require("express-session");
const path = require("path");
const jwt = require('jsonwebtoken');

// const nocache = require("nocache"); //browser cache yok
//const request=require("request");

/*Gerekli modüllerden fonksiyonların aktarılması*/

/*express için ayarlama işlemleri*/
const app = express();
app.use(cors()); //bütün origin isteklerine izin verir

// app.use(
//   session({
//     secret: "secret",
//     resave: true,
//     saveUninitialized: true,
//   })
// );

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
/*---------------------------------- */

/*global değişkenler */

const listeSabitKategori = ["Günlük", "Kişisel", "Alış veriş", "Projeler"];
const listeSabitOncelik = ["Çok Önemli", "Önemli", "Normal", "Düşük"];

var countBadges;
/* -------------------------------------- */

async function getlisteAdlari(kId) {
  try {
    let tableRows = await mysqlIslem.getListHeader(kId);
    let listeAdi = [];
    // console.log(tableRows);
    //  console.log(tableRows.length);
    for (let i = 0; i < tableRows.length; i++) {
      listeAdi[i] = tableRows[i].liste_adi;
    }
    return listeAdi;
  } catch (error) {
    console.log(error);
  }
}
async function getBadges() {
  let kisiselBadge = await mysqlIslem.getKisiselBadge();
  //console.log(kisiselBadge[0].kisiselSayisi);
  let gunlukBadge = await mysqlIslem.getGunlukBadge();
  let alisVerisBadge = await mysqlIslem.getAlisVerisBadge();
  let projelerBadge = await mysqlIslem.getProjelerBadge();

  return {
    kisisel: kisiselBadge[0].kisiselSayisi,
    gunluk: gunlukBadge[0].gunlukSayisi,
    alisVeris: alisVerisBadge[0].alisVerisSayisi,
    projeler: projelerBadge[0].projelerSayisi,
  };
}


/* Client (browser) gelen isteklerile ilgili işlemleri*/

app.get("/", function (req, res) {
  //res.send('local:3000');
  res.sendFile(path.join(__dirname + "/public/index.html"));
});

/*login işlemleri*/
app.use('/user', require('./router_files/users/User')); //users klasöründeki user.js modülü "/user" istekleri için...
/*Gun sonu işlemleri*/ 
app.use('/gunsonu',require('./router_files/gunsonu/GunSonu'));
/** Günlük ciro ile ilgili işlemler */
app.use('/gunluk',require('./router_files/gunluk_ciro/GunlukCiro'));

/*Kullanıcı kayıt ile ilgili işlemler*/
app.post("/signin", async function (req, res) {
  let ad = req.body.ad;
  let soyad = req.body.soyad;
  let email1 = req.body.email1;
  let email2 = req.body.email2;
  let sifre1 = req.body.sifre1;
  let sifre2 = req.body.sifre2;
  let bultenAbone = false;

  if (req.body.bultenAbone == "1") bultenAbone = true;

  // console.log("ad-soyad :"+ad+" "+soyad);
  // console.log("email :"+email1+" @ "+email2);
  // console.log("sifre:"+sifre1+"-"+sifre2);
  // console.log("Abone :"+bultenAbone);

  userObj = {
    isim: ad,
    soyad: soyad,
    email1: email1,
    email2: email2,
    bultenAbone: bultenAbone,
  };

  try {
    if (sifre1 !== sifre2) {
      res.render("index", {
        durum: "Hata",
        userObj,
      });

      console.log("Hata...");
    } else {
      let kId = await mysqlIslem.addUser([
        ad + " " + soyad,
        email1 + "@" + email2,
        bultenAbone,
        sifre1,
      ]);

      req.session.loggedin = true;
      req.session.username = ad;

      res.Buffer = true;
      res.ExpiresAbsolute = new Date().getHours() - 1;
      res.Expires = 0;
      res.CacheControl = "no-cache";

      res.render("index_dash", {
        kulAdi: ad,
        kulId: kId,
      });
      //res.redirect("/");
    }

    res.end();
  } catch (e) {
    console.log(e);
  }
}); // signin post

app.get("/cancel", (req, res) => {
  user = {};

  res.render("index", {
    durum: "Ok",
    user,
  });
});

app.get("/liste/:listeAdi", async function (req, res) {
  let listeIstek = req.params.listeAdi;
  //listeIstek = listeIstek.replace(/-/, " ");
  listeIstek = listeIstek.split("-").join(" "); //replace yerine raplaceAll gibi çalışır...
  console.log(listeIstek);

  // res.send(req.params.listeAdi);
  // res.end();

  let tableRows = await mysqlIslem.getListHeader(req.session.kid);
  let istekRow;
  //let modalAciklama=true;
  for (let i = 0; i < tableRows.length; i++) {
    if (tableRows[i].liste_adi === listeIstek) istekRow = tableRows[i];
  }

  var myJsonString = JSON.stringify(istekRow);

  // for (let i = 0; i < tableRows.length; i++) {
  //     listeAdlari[i] = tableRows[i].liste_adi;
  // }

  console.log(myJsonString);

  res.json(myJsonString);

  // res.render("index_dash", {
  //     kulAdi:req.session.username,
  //     kulId: req.session.kid,
  //     listeAdi: listeAdlari,
  //     tarih: getWorkDay.CurrentDate()

  // });
});

app.post("/delete", async function (req, res) {
  // let dbId = req.params.id;
  let dbId = req.body.btnSil;
  // console.log("del id:" + dbId);

  let delListe = await mysqlIslem.delListHeader(dbId);
  console.log("affected rows:" + delListe.affectedRows);
  listeAdlari = [];
  listeAdlari = await getlisteAdlari(req.session.kid);
  countBadges = await getBadges();

  // res.render("index_dash", {
  //     kulAdi: req.session.username,
  //     kulId: req.session.kid,
  //     listeAdi: listeAdlari,
  //     tarih: getWorkDay.CurrentDate(),
  //     badges:countBadges
  // });

  // if (delListe.affectedRows === 1) {
  //    // console.log(listeAdlari);
  // }
});

app.post("/list-insert", async function (req, res) {
  let gBaslik = req.body.gBaslik;
  let kategori = req.body.kategori;
  kategori = listeSabitKategori[Number(kategori) - 1];
  let oncelik = req.body.oncelik;
  oncelik = listeSabitOncelik[Number(oncelik) - 1];
  let aciklama = req.body.aciklama;
  let tarihZaman = req.body.tarZmn;
  tarihZaman = tarihZaman.replace("T", " ");

  console.log(gBaslik);
  console.log(kategori);
  console.log(oncelik);
  console.log(aciklama);
  console.log(tarihZaman);
  console.log("KulId:" + req.session.kid);

  let kId = await mysqlIslem.addNewList([
    req.session.kid,
    gBaslik,
    kategori,
    tarihZaman,
    oncelik,
    aciklama,
  ]);
  listeAdlari = await getlisteAdlari(req.session.kid);
  countBadges = await getBadges();

  // res.render("index_dash", {
  //     kulAdi: req.session.username,
  //     kulId: req.session.kid,
  //     listeAdi: listeAdlari,
  //     tarih: getWorkDay.CurrentDate(),
  //     badges:countBadges
  // });
});


/* ---------------------------------------------------------*/

/* Server kurulumu  */
app.listen(process.env.PORT || 3000, function () {
  console.log("Oyun Havuzu server running on port 3000");
});
