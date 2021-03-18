const mysql = require("mysql2");
const database = require("./db/db.js");
const inquirerQue = require("./lib/Que.js");
const { username, pass } = require("./utils/info.js").getCredentials();

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: username,
    password: pass
});
connection.connect(err => {
    if (err) throw err;
    console.log('connected as id ' + connection.threadId + '\n');
});

connection.connect(err => {
    if (err) throw err;
    database(connection);
    inquirerQue(connection);
});