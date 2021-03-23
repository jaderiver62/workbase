const inquirer = require("inquirer");

const fs = require("fs");
const path = require("path");


const infoPath = path.join(__dirname, "./userInfo.txt");

const getInfo = () => {
    if (!fs.existsSync(infoPath)) {
        throw Error("Please use `npm run input-info` to use this application");
    }

    return readInfo();
};

const readInfo = () => {
    const info = JSON.parse(
        fs.readFileSync(infoPath, (err, data) => {
            if (err) throw err;
        })
    );
    return info;
};

const saveInfo = data => fs.writeFileSync(infoPath, JSON.stringify(data, null, 4));

const infoPrompt = () => {
    console.log("Enter your MySQL crendentials to build the database  - this infomation is stored in a new file: /utils/userInfo.txt):");
    return inquirer.prompt([{
            type: "input",
            name: "username",
            message: "MySQL username: ",
            default: "root"
        }, {
            type: "password",
            name: "pass",
            message: "MySQL password: "
        }])
        .then(answers => saveInfo(answers));
};

module.exports = { getInfo, infoPrompt };