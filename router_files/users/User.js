const express = require('express');
const app = express();
const userRoute = express.Router();
//const configMySql = require(__dirname + "/public/js/mysql-config.js");
const mysqlIslem = require("../../public/js/mysql_classes.js"); //__dirname + 
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
var VerifyToken = require('../../auth/VerifyToken');
const firmaDizi = require('../../public/js/functionLys');
const obj = require('../../public/js/functionLys');

var user = {
    login: false,
    adSoyad: null,
    kulAdi: null,
    firmaWebId: null,
    yetki: null,
    avatar: null,
};
var token;
var users = [];

dotenv.config();

function generateAccessToken(user) {
    return jwt.sign(user, process.env.TOKEN_SECRET, {
        expiresIn: '1800s'
    }); //1800s=30 dakika
}



// app.post("/giris", async function (req, res) {
userRoute.post("/", async function (req, res) { // user route ait kök roout   client "/user" istekleri için...
    let username = req.body.kulAdi;
    let password = req.body.girisSifresi;

    if (username && password) {
        try {
            let results = await mysqlIslem.login(username, password);

            console.log("result:" + JSON.stringify(results));

            if (results.length != 0) {
                console.log("giriş başarılı....");
                // req.session.loggedin = true;
                // req.session.username = username;
                // req.session.kid = results[0].id;

                res.Buffer = true;
                res.ExpiresAbsolute = new Date().getHours() - 1;
                res.Expires = 0;
                res.CacheControl = "no-cache";

                user.login = true;
                user.adSoyad = results[0].ad_soyad;
                user.kulAdi = results[0].kul_adi;
                user.firmaWebId = results[0].firma_web_id;
                user.yetki = results[0].yetki;
                user.avatar = results[0].avatar;

                const findUser = users.find(
                    ({
                        firmaWebId
                    }) => firmaWebId === user.firmaWebId
                );
                if (findUser === undefined) users.push(user);
                token = generateAccessToken({user});

                // res.redirect("http://localhost/");

                res.redirect("http://localhost:8080/");
               // res.redirect("http://157.230.229.168/"); //digital ocean ubuntu server

            } else {
                console.log("giriş hatalı ?");
                //root a döndürür
                res.redirect("/"); // local 3000 e döndürür
            }
            res.end();
        } catch (e) {
            console.log("err: " + e);
        }
    } else {
        user = {};
        res.redirect("/");
        res.end();
    }
});
// VerifyToken: ara yazılım token burada çözülüp user bilgisi getiriliyor...
userRoute.get('/userdata', VerifyToken, function (req, res, next) {

    let user = req.user;//ara yazılımdan geliyor... isteekten değil.
    // console.log('user token :', user);
    res.json(JSON.stringify(user));
    next();

});
// Kullanıcı girişi ile üretielen token burada gönderilyor....
userRoute.get("/logined", function (req, res) {

    // if (user !== null) 
    if (!obj.isEmpty(user)) {

        //console.log('token ::', token);

        res.json(JSON.stringify(token));

        user = {}; //token istek sonrasıgönderildiği için user ve token boşaltılıyor. Kullanıcı 
        token = {}; //local deki token ile server dan istekte bulunacak token doğru ve süresi varsa
        //istek ile ilgili bilgiler gönderilecek.
    } else {
        res.status(500).send({
            auth: false,
            message: 'Failed to authenticate token.'
        });
        user = {};
        token = {};
    }
});

userRoute.post("/firma", async function (req, res) {

    //if (!obj.isEmpty(user)) {
        let firma = firmaDizi.olustur(req.body.data); //firma bilgisi data üzerinden geliyor.

        let results = [];

        for (let i = 0; i < firma.length; i++) {
            let data = await mysqlIslem.getFirmaData(firma[i]);
            results[i] = data[0];
        }

        console.log('firma::::' + firma + ' Uz:' + firma.length);

        // console.log(JSON.stringify(results));

        res.json(JSON.stringify(results));
    // }else{
    //     res.status(500).send({
    //         auth: false,
    //         message: 'Failed to authenticate token.'
    //     });
    // }

    // res.end();
});

userRoute.post("/logout", function (req, res) {
    // req.session.loggedin = false;
    // req.session.username = null;
    // req.session.destroy(null);

    user = {};
    token = {};

    console.log('Logout token :',(req.headers.token));

    //console.log("body: %j", req.body);

    const findIndex = users.findIndex(
        (user) => user.firmaWebId === req.body.firmaWebId
    );

    if (findIndex !== -1 && users.splice(findIndex, 1)) console.log(users);

    console.log('Logout user, token :', user,token);
    //jwt.destroy(req.headers.token);

    res.json(JSON.stringify(user));

    //arka planda yönlendirme işlemi on uça yansımadı...asenkorn işlmeden dolayı Mı?**
    //res.redirect('http://localhost:3000/');
    // res.sendFile(path.join(__dirname + '/public/index.html'));
    // res.redirect("/");
    // res.end();
});

module.exports = userRoute;