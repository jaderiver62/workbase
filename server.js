const mysql = require("mysql2");
const accessDatabase = require("./db/db.js");
const inquirerQue = require("./lib/Cue.js");
const { username, userPassword } = require("./utils/info.js").getInfo();

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: username,
    password: userPassword
});
connection.connect(err => {
    if (err) throw err;
    console.log('connected as id ' + connection.threadId + '\n');
});

connection.connect(err => {
    if (err) throw err;
    accessDatabase(connection);
    inquirerQue(connection);
});