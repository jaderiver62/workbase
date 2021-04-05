var connection;

const inquirer = require("inquirer");

const consoleTable = require('console.table');

const inquirerPrompt = dataBase => {
    connection = dataBase;
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

const addNewDepartment = () => {
    inquirer.prompt({
            type: "input",
            name: "name",
            message: "Enter the new department name:",
            validate: input => blankCheck(input)
        })
        .then(data => {
            console.log(`Added ${data.name} to the database.`);
            insertDB("department", data);
        });
};
const addNewRole = () => {
    optionQuery(`SELECT id AS "value", name AS "name" FROM department`, false)
        .then(departments =>
            inquirer.prompt([{
                    type: "input",
                    name: "title",
                    message: "What the role's title?",
                    validate: input => blankCheck(input)
                },
                {
                    type: "number",
                    name: "salary",
                    message: "What is the role's yearly salary?",
                    validate: input => numCheck(input),
                    filter: input => clearNum(input)
                },
                {
                    type: "list",
                    name: "department_id",
                    message: "What is the role's department?",
                    choices: deptChoices
                }
            ])
        )
        .then(data => {
            console.log(`Added ${data.title} to the database.`);
            insertDB("role", data);
        });
};

const addEmployee = () => {
    let roles = [];
    optionQuery(`SELECT id AS "value", title AS "name" FROM role`, false)
        .then(result => {
            roles.push(result);
            return optionQuery(`SELECT id AS "value", 
        CONCAT(first_name, " ", last_name) AS "name" FROM employee`, true);
        })
        .then(result => {
            roles.push(result);
            return inquirer.prompt([{
                    type: "input",
                    name: "first_name",
                    message: "What the employee's first name?",
                    validate: input => (input) ? true : `Employee records must contain a first name.`
                },
                {
                    type: "input",
                    name: "last_name",
                    message: "What the employee's last name?",
                    validate: input => (input) ? true : `Employee records must contain a last name.`
                },
                {
                    type: "list",
                    name: "role_id",
                    message: "What the employee's role?",
                    choices: roles[0]
                },
                {
                    type: "list",
                    name: "manager_id",
                    message: "Who is the employee's manager?",
                    choices: roles[1]
                }
            ])
        })
        .then(data => {
            console.log(`Added ${data.first_name} ${data.last_name} to the database.`);
            insertDB("employee", data);
        });
};

const optionQuery = (query, input) => {
    let optionArray = [];
    if (input) optionArray.push({ name: "None", value: null });

    return getOptions(query).then(result => {
        for (let i = 0; i < result.length; i++) {
            optionArray.push({ name: result[i].name, value: result[i].value });
        }
        return optionArray;
    });
};

const getOptions = (query) => {
    return new Promise((resolve, reject) => {
        connection.query(query, (err, result) => {
            if (err) reject(err);

            else resolve(result);
        });
    })
};

// close connection
const close = () => {
    console.log("Database connection closing...");
    connection.end();
    console.log("Good Bye!");
};

// validation functions
const blankCheck = input => (input) ? true : `You can't leave this blank.`;
const numCheck = input => (input && !isNaN(input)) ? true : `Please enter a valid number.`;
const clearNum = input => (input && !isNaN(input)) ? input : "";


const getEmployees = () => accessDB(`SELECT e.first_name, e.last_name, title, name AS "department", 
salary, CONCAT(m.first_name, " ", m.last_name) AS "manager" FROM employee e 
JOIN role ON role_id = role.id
JOIN department ON department_id = department.id
LEFT JOIN employee m ON e.manager_id = m.id`);

const getDepartments = () => accessDB(`SELECT * FROM department`);

const getRoles = () => accessDB(`SELECT title, salary, name AS "department" FROM role 
JOIN department ON department_id = department.id`);