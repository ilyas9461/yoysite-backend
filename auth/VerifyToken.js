const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const dotenv = require('dotenv');

dotenv.config();
//Middleware ara yazılım istekten gelen req bilgisindeki header üzerinden token bilgisini alarak
//çözümünü yapar. req üzerinden istek fonksiyonuna pass eder. Token de hata varsa isteği gönderene 
// hata döndürür.
function verifyToken(req, res, next) {
  try {
    // check header or url parameters or post parameters for token
    let token = (req.headers.token); //['x-access-token'];

    if (!token)
      return res.status(403).send({auth: false, message: 'No token provided.' });
    else {
      //console.log('verifyToken.js : ', token);
      token = JSON.parse(token);
     // console.log('verifyToken.js : ', token);

      // verifies secret and checks exp
      jwt.verify(token, process.env.TOKEN_SECRET, function (err, decoded) {
        if (err) {
          return res.status(500).send({
            auth: false,
            message: 'Failed to authenticate token.'
          });
          //console.log('ERR :',err); 
        }
        // console.log('decode :', decoded);
        // if everything is good, save to request for use in other routes
        req.user = decoded.user;
        next(); //isteği bir sonraki fonksiyona aktarır ve onun işltilemesini sağlar.
      });
    }

  } catch (error) {
    console.log(error);
  }

}

module.exports = verifyToken;