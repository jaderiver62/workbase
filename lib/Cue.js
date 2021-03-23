const inquirer = require("inquirer");
const cTable = require('console.table');
var connection;

const inquirerPrompt = db => {
    connection = db;
    console.log(`
  _   _   _   _     _   _   _   _  
 / \ / \ / \ / \   / \ / \ / \ / \ 
( W | o | r | k ) ( B | a | s | e )
 \_/ \_/ \_/ \_/   \_/ \_/ \_/ \_/ 
 `);
    menu();
};
const menu = () => {

    inquirer.prompt({
        type: "list",
        name: "choice",
        message: "Select an option: ",
        choices: [
            "View Departments", "View Roles", "View Employees",
            "Add New Department", "Add New Role", "Add New Employee",
            "Update Employee", "Exit"
        ]
    }).then(({ selection }) => {
        if (selection === "View Departments") {
            getDepartments();
            break;
        } else if (selection === "View Roles") {
            getRoles();
            break;
        } else if (selection === "View Employees") {
            getEmployees();
            break;
        } else if (selection === "Add New Department") {
            getDepartment();
            break;
        } else if (selection === "Add New Role") {
            newRole();
            break;
        } else if (selection === "Add New Employee") {
            newEmployee();
            break;
        } else if (selection === "Update Employee") {
            updateEmployee();
            break;
        } else { close(); }
    });
};

const getEmployees = () => accessDB(`SELECT e.first_name, e.last_name, title, name AS "department", 
salary, CONCAT(m.first_name, " ", m.last_name) AS "manager" FROM employee e 
JOIN role ON role_id = role.id
JOIN department ON department_id = department.id
LEFT JOIN employee m ON e.manager_id = m.id`);

const getDepartments = () => accessDB(`SELECT * FROM department`);

const getRoles = () => accessDB(`SELECT title, salary, name AS "department" FROM role 
JOIN department ON department_id = department.id`);