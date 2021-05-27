const mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config({path:__dirname+'/../../.env'});

//console.log('WEB HOST :', process.env.WEB_HOST);

// const db = mysql.createPool({
//   host: "localhost",
//   user: process.env.LOCAL_USER,
//   password:process.env.LOCAL_PASS,
//   database:process.env.LOCAL_DATABASE,
//   multipleStatements: true,
//   dateStrings: true
// });

/** Uzak WEb */

const db = mysql.createPool({
  host: process.env.WEB_HOST,
  user: process.env.WEB_USER,
  password:process.env.WEB_PASS,
  database:process.env.WEB_DATABASE,
  multipleStatements: true,
  dateStrings: true
});

db.getConnection( async (err) => {
    if (err) console.log(err, new Date());
    else console.log("Connect to DB -> "+ new Date());
});

module.exports = db;

