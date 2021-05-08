
// let config = {
//     host: "localhost",
//     user: "root",
//     password: "yoyuncak26",
//     database: "node-listeler",
// };
//module.exports = config;

const mysql = require('mysql');

// Create pool to prevent database inactivity
// const db = mysql.createPool({
//   host: "localhost",
//   user: "root",
//   password:"yoyuncak26",
//   database:"node-listeler",
//   multipleStatements: true
// });

// const db = mysql.createPool({
//   host: "eu-cdbr-west-03.cleardb.net",
//   user: "bbf75df5a31d3c",
//   password:"3a9a142a",
//   database:"heroku_ebb721ed41cb134",
//   multipleStatements: true
// });

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password:"yoyuncak26",
  database:"oyun_havuzu",
  multipleStatements: true,
  dateStrings: true
});



db.getConnection( async (err) => {
    if (err) console.log(err, new Date());
    else console.log("Connect to DB -> "+ new Date());
});

module.exports = db;

