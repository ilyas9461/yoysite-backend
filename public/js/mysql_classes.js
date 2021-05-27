// const URL = 'http://localhost:3000';
const URL='http://157.230.229.168:3000';  ///digital ocean ubuntu server

const db = require('./mysql-config');

class MySqlDBClass {

    // ==== CORE FUNCTION : Değiştirilmeyecek olan ana fonksiyonlar.
    // Yardımcı fonksiyonlar işlemlerini bu fonksiyonlar ile yaparlar.
    // Promise yapısını kullanarak asenkron (sıralı işlemler)işlem yapısını 
    // oluştururlar.
    static doQuery(queryToDo) {
        return new Promise(async (resolve, reject) => {
            try {
                const query = queryToDo;
                db.query(query, (err, result) => {

                    if (err) reject(err);
                    else resolve(result);
                });
            } catch (err) {
                console.log(err);
                reject(err);
            }

        });
    }

    static doInsert(queryToDo, array) {
        return new Promise(async (resolve, reject) => {
            try {
                const query = queryToDo;
                db.query(query, array, function (err, result) {

                    if (err) console.log(err);
                    else resolve(result);
                });
            } catch (err) {
                console.log(err);
                reject(err);
            }
        });
    }
    //  ===== core =====

    // === Yardımcı Fonksiyonlar: Amaca uygun sorguları yürütürler  =================
    static anlikTarihSaat() {
        let datetime = new Date();
        let tar1;
        datetime = datetime.toLocaleString(); //29.04.2021 09:25:17

        // console.log("mysql class anlik datetime: ", datetime);


        if (URL === 'http://localhost:3000') {
            /* Local serverda çalışırken tarih formatı... */

            tar1 = datetime.split(" ")[0];
            //let zaman= datetime.split(" ")[1];
            //console.log("mysql class anlik tarih : ", tar1);

            let [day, month, year] = [...tar1.split(".")]; //  16.05.2021
            tar1 = year + "-" + month + "-" + day; // 

            /**   ********  */
        } else {
            tar1 = datetime.split(",")[0];
            //let zaman= datetime.split(" ")[1];
            //console.log("mysql class anlik tarih : ", tar1);

            let [month, day, year] = [...tar1.split("/")]; // 5/15/2021, 12:30:14 PM server formatı
            if (Number(day) < 10) day = '0' + day;
            if (Number(month) < 10) month = '0' + month;

            tar1 = year + "-" + month + "-" + day; // server tarfında böyle oldu digital ocean ubuntu  
        }


        //console.log("mysql class anlik tarih : ", tar1);
        // return (tar1 +' '+zaman);
        return tar1;
    }
    /** Bu fonksiyonlar çağrıldıkları yerde await ifadesi ile çağrılmalı ve çağıran 
     * fonksiyonunda (get, post istek işleme callback fonksiyonu) async öneki alması gerekir.
     */
    static login(kAdi, sifre) {
        //const query = "SELECT * FROM users WHERE pseudo = '" + pseudo + "' AND password = '" + password + "'";
        //const query ="SELECT * FROM kullanicilar WHERE kullanici_adi ='"+ kAdi+"' AND kullanici_sifre='"+sifre+"'";
        const query = "SELECT * FROM web_user WHERE kul_adi ='" + kAdi + "' AND sifre='" + sifre + "'";
        return this.doQuery(query);
    }

    static getGunSonu(firma, tar1, tar2) {
        //const query = "SELECT * FROM users WHERE pseudo = '" + pseudo + "' AND password = '" + password + "'";
        //const query ="SELECT * FROM kullanicilar WHERE kullanici_adi ='"+ kAdi+"' AND kullanici_sifre='"+sifre+"'";
        const query = "SELECT * FROM gunluk_kasa " +
            "WHERE " +
            "firma_web_id ='" + firma + "' AND (tarih >= '" + tar1 + " 00:00:00'" + " AND tarih < '" + tar2 + " 00:00:00' )"+
            "ORDER BY  tarih";  //artan sırada sırala

        //"SELECT * FROM gunluk_kasa WHERE firma_web_id ='" + firma + "' AND (tarih >='" + tar1 + " 00:00:10" + "'" + " AND tarih <'" + tar2 + " 23:59:59" + "')";
       // console.log(query);
        return this.doQuery(query);
    }

    static tarihliListeler(sorguListe) {

        if (sorguListe.islem === 'Gun Sonu') {
           // console.log("/tarihliliste: GUN SONU", sorguListe);
            return this.getGunSonu(sorguListe.firma, sorguListe.tar1, sorguListe.tar2);

        }

        if (sorguListe.islem === 'Masraf') {
            const query = "SELECT " +
                "kasa_cikis.cikis_adi, cikis_turu.cesit, kasa_cikis.cikis_tutar,  kasa_cikis.tarih_zaman, kasa_cikis.islem_not " +
                "FROM " + "kasa_cikis " +
                "INNER JOIN cikis_turu " +
                "ON kasa_cikis.cikis_tur_id = cikis_turu.id " +
                "WHERE ((kasa_cikis.cikis_adi='MASRAF' or kasa_cikis.cikis_adi='ODEME') " +
                "and kasa_cikis.firma_web_id='" + sorguListe.firma + "' " +
                "and (kasa_cikis.tarih>='" + sorguListe.tar1 + "' and kasa_cikis.tarih < '" + sorguListe.tar2 + "')) "+
                "ORDER BY kasa_cikis.tarih_zaman";  //artan sırada sırala
            return this.doQuery(query);
        }

        if (sorguListe.islem === 'Banka Elden') {

            const query = "SELECT " +
                "kasa_cikis.cikis_adi, kasa_cikis.cikis_tutar, bankalar.banka_adi, kasa_cikis.tarih_zaman, kasa_cikis.islem_not " +
                "FROM kasa_cikis " +
                "INNER JOIN bankalar ON kasa_cikis.banka_id = bankalar.id " +
                "WHERE kasa_cikis.cikis_adi = 'BANKA' AND firma_web_id='" + sorguListe.firma + "' " +
                "and (kasa_cikis.tarih>='" + sorguListe.tar1 + "' and kasa_cikis.tarih < '" + sorguListe.tar2 + "')"+
                "UNION " +
                "SELECT " +
                "kasa_cikis.cikis_adi, kasa_cikis.cikis_tutar, kasa_cikis.banka_id, kasa_cikis.tarih_zaman, kasa_cikis.islem_not " +
                "FROM kasa_cikis " +
                "WHERE kasa_cikis.cikis_adi = 'ELDEN VERILEN' AND kasa_cikis.firma_web_id='" + sorguListe.firma + "' " +
                "and (kasa_cikis.tarih>='" + sorguListe.tar1 + "' and kasa_cikis.tarih < '" + sorguListe.tar2 + "') " +
                "ORDER BY tarih_zaman"; //artan sırada sırala

               // console.log("sorgu : " ,query);

            return this.doQuery(query);

        }
    }


    static async getSonGunSonu(firma) {
        // const query = "SELECT * FROM gunluk_kasa WHERE firma_web_id ='" + firma + 
        // "' AND (tarih>'" + tar1 + " 00:00:10" + "'" + " AND tarih<'" + tar2 + " 23:59:59" + "')";

        let query = "SELECT * from gunluk_kasa WHERE firma_web_id='" + firma + "' order by tarih desc limit 0,1";
        let gunSonu = await this.doQuery(query);

        /* Anlık ciro için işlemler */
        const tarih = this.anlikTarihSaat();

        query = "SELECT SUM(toplam_tutar) AS toplam FROM satislar WHERE (firma_web_id='" + firma + "' and odeme_turu='NAKIT' and tarih='" + tarih + "')";
        let nakitSatislar = await this.doQuery(query); //{"toplam":1055} 
        query = "SELECT SUM(toplam_tutar) AS toplam FROM satislar WHERE (firma_web_id='" + firma + "' and odeme_turu='KKARTI' and tarih='" + tarih + "')";
        let kkartiSatislar = await this.doQuery(query);

        query = "SELECT SUM(tutar) AS toplam FROM misafir_odemeler WHERE (firma_web_id='" + firma + "' and odeme_turu='KKARTI' and tarih='" + tarih + "')";
        let kkartiMisafirOdemeler = await this.doQuery(query);
        query = "SELECT SUM(tutar) AS toplam FROM misafir_odemeler WHERE (firma_web_id='" + firma + "' and odeme_turu='NAKIT' and tarih='" + tarih + "')";
        let nakitMisafirOdemeler = await this.doQuery(query);

        let nakit = Number(nakitSatislar[0].toplam) + Number(nakitMisafirOdemeler[0].toplam);
        let kkarti = Number(kkartiSatislar[0].toplam) + Number(kkartiMisafirOdemeler[0].toplam);

        let toplam_satis = Number(nakitSatislar[0].toplam) + Number(kkartiSatislar[0].toplam);
        let toplam_islem = Number(nakitMisafirOdemeler[0].toplam) + Number(kkartiMisafirOdemeler[0].toplam);
        let toplam_ciro = toplam_satis + toplam_islem;

        query = "SELECT SUM(cikis_tutar) AS toplam FROM kasa_cikis WHERE " +
            "(firma_web_id ='" + firma + "' AND tarih ='" + tarih + "') AND (cikis_adi = 'MASRAF' OR cikis_adi = 'ODEME')";
        let anlikMasraf = await this.doQuery(query);
        anlikMasraf = Number(anlikMasraf[0].toplam);

        query = "SELECT SUM(cikis_tutar) AS toplam FROM kasa_cikis WHERE " +
            "(firma_web_id ='" + firma + "' AND tarih ='" + tarih + "') AND (cikis_adi = 'BANKA' OR cikis_adi = 'ELDEN VERILEN')";
        let bankaElden = await this.doQuery(query);
        bankaElden = Number(bankaElden[0].toplam);

        query = "SELECT  kullanici_giris_takip.basarili_girisler, kullanicilar.kullanici_adi " +
            "FROM kullanici_giris_takip " +
            "INNER JOIN kullanicilar ON kullanici_giris_takip.kullanici_id = kullanicilar.id " +
            "WHERE kullanici_giris_takip.firma_web_id = '" + firma + "'" +
            "ORDER BY kullanici_giris_takip.basarili_girisler  DESC LIMIT 0, 1";

        let kasiyer = await this.doQuery(query);

        kasiyer = kasiyer[0].kullanici_adi;

        let gunluk_kasa = (toplam_ciro - anlikMasraf - bankaElden);

        const anlikGunSonu = {
            toplam_satis: toplam_satis,
            toplam_islem: toplam_islem,
            toplam_ciro: toplam_ciro,
            nakit_para_tutar: nakit,
            kredi_karti_tutar: kkarti,
            masraf_tutar: anlikMasraf,
            banka_tutar: bankaElden,
            gunluk_kasa: gunluk_kasa,
            tarih: tarih,
            kasiyer: kasiyer
        };

        let retObj = {
            sonGunSonu: gunSonu,
            anlikGunSonu: anlikGunSonu
        };

        //console.log('mysql gunSonu: ',retObj);

        return retObj;
    }
    static getFirmaData(firmaId) {
        //const query = "SELECT * FROM users WHERE pseudo = '" + pseudo + "' AND password = '" + password + "'";
        //const query ="SELECT * FROM kullanicilar WHERE kullanici_adi ='"+ kAdi+"' AND kullanici_sifre='"+sifre+"'";
        const query = "SELECT * FROM firma_bilgi WHERE firma_web_id ='" + firmaId + "'";
        // console.log(query);
        return this.doQuery(query);
    }
    static async getSonGunSonuCiroAyrinti(firmaId, tarih) {

        let query = "SELECT SUM(toplam_tutar) AS toplam FROM satislar WHERE (firma_web_id='" + firmaId + "' and odeme_turu='NAKIT' and tarih='" + tarih + "')";
        let nakitSatislar = await this.doQuery(query); //{"toplam":1055} 
        query = "SELECT SUM(toplam_tutar) AS toplam FROM satislar WHERE (firma_web_id='" + firmaId + "' and odeme_turu='KKARTI' and tarih='" + tarih + "')";
        let kkartiSatislar = await this.doQuery(query);

        query = "SELECT SUM(tutar) AS toplam FROM misafir_odemeler WHERE (firma_web_id='" + firmaId + "' and odeme_turu='KKARTI' and tarih='" + tarih + "')";
        let kkartiMisafirOdemeler = await this.doQuery(query);
        query = "SELECT SUM(tutar) AS toplam FROM misafir_odemeler WHERE (firma_web_id='" + firmaId + "' and odeme_turu='NAKIT' and tarih='" + tarih + "')";
        let nakitMisafirOdemeler = await this.doQuery(query);

        let nakit = Number(nakitSatislar[0].toplam) + Number(nakitMisafirOdemeler[0].toplam);
        let kkarti = Number(kkartiSatislar[0].toplam) + Number(kkartiMisafirOdemeler[0].toplam);

        query = "SELECT SUM(toplam_tutar) AS toplam FROM satislar WHERE (firma_web_id='" + firmaId +
            "' and (odeme_turu='NAKIT' or odeme_turu='KKARTI')and satis_tur='KART YUKLEME' and tarih='" + tarih + "')";
        let kartYukleme = await this.doQuery(query);

        query = "SELECT SUM(toplam_tutar) AS toplam FROM satislar WHERE (firma_web_id='" + firmaId +
            "' and (odeme_turu='KART_DEPOSITO_NAKIT' or odeme_turu='KART_DEPOSITO_KKARTI')and satis_tur='KART YUKLEME' and tarih='" + tarih + "')";
        let deposit = await this.doQuery(query);

        query = "SELECT SUM(toplam_tutar) AS toplam FROM satislar WHERE (firma_web_id='" + firmaId +
            "' and (odeme_turu='KART_DEPOSIT_IADE')and satis_tur='KART YUKLEME' and tarih='" + tarih + "')";
        let depositIade = await this.doQuery(query);

        query = "SELECT SUM(toplam_tutar) AS toplam FROM satislar WHERE (firma_web_id='" + firmaId +
            "' and (odeme_turu='KART PROMASYON')and satis_tur='KART YUKLEME' and tarih='" + tarih + "')";
        let kartPromasyon = await this.doQuery(query);

        query = "SELECT COUNT(id) AS toplam FROM satislar WHERE (firma_web_id='" + firmaId +
            "' and (odeme_turu='KART_DEPOSITO_NAKIT' or odeme_turu='KART_DEPOSITO_KKARTI')and satis_tur='KART YUKLEME' and tarih='" + tarih + "')";
        let kartSayisi = await this.doQuery(query);

        query = "SELECT COUNT(id) AS toplam FROM satislar WHERE (firma_web_id='" + firmaId +
            "' and (odeme_turu='KART_DEPOSIT_IADE')and satis_tur='KART YUKLEME' and tarih='" + tarih + "')";
        let kartIadeSayisi = await this.doQuery(query);

        let satilanKartSayisi = Number(kartSayisi[0].toplam) - Number(kartIadeSayisi[0].toplam);

        query = "SELECT SUM(toplam_tutar) AS toplam FROM satislar WHERE (firma_web_id='" + firmaId +
            "' and (odeme_turu='NAKIT' or odeme_turu='KKARTI')and satis_tur='URUN' and tarih='" + tarih + "')";
        let urunSatislar = await this.doQuery(query); //{"toplam":1055} 

        const GunSonuDetayData = {
            data: [{
                    ad: "Toplam Nakit TL",
                    deger: nakit
                },
                {
                    ad: "Toplam KKartı  TL",
                    deger: kkarti
                },
                {
                    ad: "",
                    deger: ""
                },
                {
                    ad: "Kart Yükleme TL",
                    deger: kartYukleme[0].toplam
                },
                {
                    ad: "Deposit TL",
                    deger: deposit[0].toplam
                },
                {
                    ad: "Deposit İade TL",
                    deger: depositIade[0].toplam
                },
                {
                    ad: "Kart Promasyon TL",
                    deger: kartPromasyon[0].toplam
                },
                {
                    ad: "Satılan Kart Sayısı(Adet)",
                    deger: satilanKartSayisi
                },
                {
                    ad: "",
                    deger: ""
                },
                {
                    ad: "Ürün Satış TL",
                    deger: urunSatislar[0].toplam
                },
                {
                    ad: "",
                    deger: ""
                },
            ]
        };
        //console.log('GunSonuDetayData :',GunSonuDetayData);
        return GunSonuDetayData;
    }

    static getSonGunSonuBanka(firmaId, tarih) {
        const query = "SELECT * FROM kasa_cikis WHERE firma_web_id='" + firmaId +
            "' and tarih='" + tarih + "' AND (cikis_adi='BANKA' or cikis_adi='ELDEN VERILEN')";
        return this.doQuery(query);
    }

    static getSonGunSonuMasraf(firmaId, tarih) {
        const query = "SELECT " +
            "kasa_cikis.cikis_adi, cikis_turu.tur, cikis_turu.cesit, kasa_cikis.cikis_tutar, kasa_cikis.islem_not " +
            "FROM " + "kasa_cikis " +
            "INNER JOIN cikis_turu " +
            "ON kasa_cikis.cikis_tur_id = cikis_turu.id " +
            "WHERE ( (kasa_cikis.cikis_adi='MASRAF' or kasa_cikis.cikis_adi='ODEME') and kasa_cikis.firma_web_id='" + firmaId +
            "' and kasa_cikis.tarih='" + tarih + "')";

        return this.doQuery(query);
    }



    /*     ******  eski kodlar *******/
    static addUser(userInfos) { //Dizi şeklinde kaydedilecek bilgiler çağrıldığı yerde girilir.
        //sorgudaki soru işareti sıralamasına göre veriler diziye yerleştirilmelidir.
        let query = "INSERT INTO kullanicilar(id, kulAdi, email, bulten, sifre) VALUES (NULL, ?, ?, ?, ?)";
        let insertedQuery = this.doInsert(query, userInfos);
        return insertedQuery.then((r, e) => {
            let iduser = r.insertId;
            return iduser;
            //   let queryClasse = "INSERT INTO dansclasse(iduser, idclasse) VALUES (?, ?)";
            //   return this.doInsert(queryClasse, [iduser, classe]);
        });
    }

    static addNewList(listInfos) {
        let query = "INSERT INTO listeler(id, kul_id, liste_adi, kategori, tarih, oncelik, aciklama) VALUES (NULL, ?, ?, ?, ?, ?, ?)";
        let insertedQuery = this.doInsert(query, listInfos);
        return insertedQuery.then((r, e) => {
            let idlist = r.insertId;
            return idlist;
        });
    }
    static getListHeader(kulId) {
        const query = "SELECT * FROM listeler WHERE kul_id=" + kulId;
        return this.doQuery(query);
    }

    static getKisiselBadge() {
        let query = "SELECT COUNT(id) As kisiselSayisi From listeler WHERE kategori='Kişisel'";
        return this.doQuery(query);
    }
    static getGunlukBadge() {
        let query = "SELECT COUNT(id) As gunlukSayisi From listeler WHERE kategori='Günlük'";
        return this.doQuery(query);
    }
    static getAlisVerisBadge() {
        let query = "SELECT COUNT(id) As alisVerisSayisi From listeler WHERE kategori='Alış veriş'";
        return this.doQuery(query);
    }
    static getProjelerBadge() {
        let query = "SELECT COUNT(id) As projelerSayisi From listeler WHERE kategori='Projeler'";
        return this.doQuery(query);
    }

    static delListHeader(delId) {
        const query = "DELETE FROM `listeler` WHERE id=" + delId;
        return this.doQuery(query);
    }

    //  ==== Yardımcı Fonksiyonlar  ====

} //class

module.exports = MySqlDBClass;