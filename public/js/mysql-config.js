const mysql = require('mysql');

// const db = mysql.createPool({
//   host: "localhost",
//   user: "root",
//   password:"yoyuncak26",
//   database:"oyun_havuzu",
//   multipleStatements: true,
//   dateStrings: true
// });
const db = mysql.createPool({
  host: "157.230.229.168",
  user: "yoyuncak26",
  password:"l4W1ule0hlemV2me",
  database:"oyun_havuzu_web",
  multipleStatements: true,
  dateStrings: true
});


db.getConnection( async (err) => {
    if (err) console.log(err, new Date());
    else console.log("Connect to DB -> "+ new Date());
});

module.exports = db;

