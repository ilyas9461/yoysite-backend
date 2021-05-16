

// if (req.body.user.length > 0) {
//     for (let i = 0; i < req.body.user.length; i++) {
//         let firmaId = Number(req.body.user.split(",")[i]); //46,8,.. kullanıcı firmaWebId eri
//         if (!Number.isNaN(firmaId)) {
//             firma[ind++] = firmaId;
//         }
//     }
// }

exports.olustur = firmaDiziOlustur;
function firmaDiziOlustur(userFirma) {
    let firma = [];
    let ind = 0;

    if (userFirma.length > 0) {

        for (let i = 0; i < userFirma.length; i++) {
            let firmaId = Number(userFirma.split(",")[i]); //46,8,.. kullanıcı firmaWebId eri
            if (!Number.isNaN(firmaId)) {
                firma[ind++] = firmaId;
            }
        }
    }

    return firma;

}
exports.isEmpty=isEmptyObj;
function isEmptyObj(obj) {
    for (var i in obj) return false;
    return true;
  }