const mysql = require('mysql');

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password:"xxxxx",
  database:"oyun_havuzu",
  multipleStatements: true,
  dateStrings: true
});


db.getConnection( async (err) => {
    if (err) console.log(err, new Date());
    else console.log("Connect to DB -> "+ new Date());
});

module.exports = db;

