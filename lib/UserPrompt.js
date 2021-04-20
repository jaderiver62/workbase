var connection;
const cTable = require('console.table');
const inquirer = require("inquirer");
const figlet = require("figlet");




const inquirerPrompt = dataBase => {
    connection = dataBase;
    startWorkbase();
};

async function getLogo() {
    return new Promise((resolve, reject) => {
        figlet.text('WorkBase', {
            font: 'ANSI Shadow',
            horizontalLayout: 'fitted',
            verticalLayout: 'defafittedult',
            width: 80,
            whitespaceBreak: true
        }, function(error, data) {
            if (error) {
                console.log('Something went wrong...');
                console.dir(error);
                return;
            }
            resolve(data);
        });

    })

}
async function startWorkbase() {
    let result = await getLogo();
    console.log(result);
    menu();
}
const menu = () => {
    inquirer.prompt({
        type: "list",
        name: "choice",
        message: "Select an option: ",
        choices: [
            "Add New Department", "Add New Role", "Add New Employee",
            "View Departments", "View Roles", "View Employees", "View Employees By Manager", "View Employees By Department",
            "Update Employee", "Update Employee's Manager", "Delete Department", "Delete Role", "Exit"
        ]
    }).then(({
        choice
    }) => {
        switch (choice) {
            case "Add New Department":
                addNewDepartment();
                break;
            case "Add New Role":
                addNewRole();
                break;
            case "Add New Employee":
                addNewEmployee();
                break;
            case "View Departments":
                getDepartments();
                break;
            case "View Roles":
                getRoles();
                break;
            case "View Employees":
                getEmployees();
                break;
            case "View Employees By Manager":
                getEmployeesByManager();
                break;
            case "View Employees By Department":
                getEmployeesByDepartment();
                break;
            case "Update Employee":
                updateEmployee();
                break;
            case "Update Employee's Manager":
                updateManager();
                break;
            case "Delete Department":
                deleteDepartmentInquirer();
                break;
            case "Delete Role":
                deleteRoleInquirer();
                break;
            default:
                exit();
        }
    });
};


const getEmployees = () => accessDatabase(`SELECT e.first_name, e.last_name, title, name AS "department", 
salary, CONCAT(m.first_name, " ", m.last_name) AS "manager" FROM employee e 
JOIN role ON role_id = role.id
JOIN department ON department_id = department.id
LEFT JOIN employee m ON e.manager_id = m.id`);

const getDepartments = () => accessDatabase(`SELECT * FROM department`);

const getRoles = () => accessDatabase(`SELECT title, salary, name AS "department" FROM role 
JOIN department ON department_id = department.id`);

const getEmployeesByManager = () => accessDatabase(`SELECT CONCAT(m.first_name, " ", m.last_name) AS "manager",  CONCAT(e.first_name, " ", e.last_name) AS "employee",  title, name AS "department"
FROM employee m, employee e
JOIN role ON role_id = role.id
JOIN department ON department_id = department.id
WHERE m.id = e.manager_id`);

const getEmployeesByDepartment = () => accessDatabase(`SELECT name AS "department", title, CONCAT(e.first_name, " ", e.last_name) AS "employee", e.id, salary, CONCAT(m.first_name, " ", m.last_name) AS "manager"
FROM employee e
JOIN role ON role_id = role.id
JOIN department ON department_id = department.id
LEFT JOIN employee m ON e.manager_id = m.id`);

const deleteDepartment = (department_id) => accessDatabase(`DELETE FROM department
WHERE  department.id = ${department_id}`);

const deleteRole = (role_id) => accessDatabase(`DELETE FROM role
WHERE  role.id = ${role_id}`);

const addNewDepartment = () => {
    inquirer.prompt({
            type: "input",
            name: "name",
            message: "Enter the new department name:",
            validate: input => (input) ? true : `Department must have a name`
        })
        .then(data => {
            console.log(`Added ${data.name} to the database.`);
            insertDatabase("department", data);
        });
};

const addNewRole = () => {
    optionQuery(`SELECT id AS "value", name AS "name" FROM department`, false)
        .then(departments =>
            inquirer.prompt([{
                    type: "input",
                    name: "title",
                    message: "What the role's title?",
                    validate: input => (input) ? true : `Role must have a name`
                },
                {
                    type: "number",
                    name: "salary",
                    message: "What is the role's yearly salary?",
                    validate: input => (input && !isNaN(input)) ? true : `Role records must have a salary value that is a valid number`,
                    filter: input => (input && !isNaN(input)) ? input : ""
                },
                {
                    type: "list",
                    name: "department_id",
                    message: "What is the role's department?",
                    choices: departments
                }
            ])
        )
        .then(data => {
            console.log(`Added ${data.title} to the database.`);
            insertDatabase("role", data);
        });
};

const addNewEmployee = () => {
    let arr = [];
    optionQuery(`SELECT id AS "value", title AS "name" FROM role`, false)
        .then(result => {
            arr.push(result);
            return optionQuery(`SELECT id AS "value", 
        CONCAT(first_name, " ", last_name) AS "name" FROM employee`, true);
        })
        .then(result => {
            arr.push(result);
            return inquirer.prompt([{
                    type: "input",
                    name: "first_name",
                    message: "Employee's first name: ",
                    validate: input => (input) ? true : `Employee records must contain a first name.`
                },
                {
                    type: "input",
                    name: "last_name",
                    message: "Employee's last name: ",
                    validate: input => (input) ? true : `Employee records must contain a last name.`
                },
                {
                    type: "list",
                    name: "role_id",
                    message: "Enter the employee's: ",
                    choices: arr[0]
                },
                {
                    type: "list",
                    name: "manager_id",
                    message: "Enter the employee's manager: ",
                    choices: arr[1]
                }
            ])
        })
        .then(data => {
            insertDatabase("employee", data);
            console.log(`${data.first_name} ${data.last_name} has been added to the database`);
        });
};

const updateEmployee = () => {
    let arr = [];
    optionQuery(`SELECT id AS "value", CONCAT(first_name, " ", last_name) 
    AS "name" FROM employee`, false)
        .then(result => {
            arr.push(result);
            return optionQuery(`SELECT id AS "value", title AS "name" FROM role`, false);
        })
        .then(result => {
            arr.push(result);
            return inquirer.prompt([{
                    type: "list",
                    name: "id",
                    message: "Select the employee to be updated: ",
                    choices: arr[0]
                },
                {
                    type: "list",
                    name: "role_id",
                    message: "Enter the employee's role: ",
                    choices: arr[1]
                }
            ])
        })
        .then(data => {
            console.log(`Employee information has been updated in the database `);
            updateDatabase("employee", [{
                role_id: data.role_id
            }, {
                id: data.id
            }]);
        });
};
const updateManager = () => {
    optionQuery(`SELECT id AS "value", CONCAT(first_name, " ", last_name) 
    AS "name" FROM employee`, false)
        .then(result => {
            return inquirer.prompt([{
                type: "list",
                name: "id",
                message: "Select the employee to be updated: ",
                choices: result
            }, {
                type: "list",
                name: "manager_id",
                message: "Enter the employee's manager: ",
                choices: result
            }])
        })
        .then(data => {
            console.log(`Employee information has been updated in the database `);
            updateDatabase("employee", [{
                manager_id: data.manager_id
            }, {
                id: data.id
            }]);
        });
};
const deleteDepartmentInquirer = () => {
    optionQuery(`SELECT id AS "value", name AS "name" FROM department`, false)
        .then(result => {
            return inquirer.prompt([{
                type: "list",
                name: "id",
                message: "Select the database to be deleted: ",
                choices: result
            }])
        })
        .then(data => {
            console.log(`The department has been deleted in the database `);
            deleteDepartment(data.id);
        });
}
const deleteRoleInquirer = () => {
    optionQuery(`SELECT id AS "value", title AS "name" FROM role `, false)
        .then(result => {
            return inquirer.prompt([{
                type: "list",
                name: "id",
                message: "Select the role to be deleted: ",
                choices: result
            }])
        })
        .then(data => {
            console.log(`The role has been deleted in the database `);
            deleteRole(data.id);
        });
}
const accessDatabase = databaseQuery => {
    connection.query(databaseQuery, (err, result) => {
        if (err) throw err;
        console.table(result);
        menu();
    });
};

const insertDatabase = (table, params) => {
    connection.query(`INSERT INTO ${table} SET ?`, params, (err, result) => {
        if (err) throw err;
        menu();
    });
};

const updateDatabase = (table, params) => {
    console.log(params);
    connection.query(`UPDATE ${table} SET ? WHERE ?`, params, (err, result) => {
        if (err) throw err;
        menu();
    });
};



const optionQuery = (query, isNull) => {
    let arr = [];
    if (isNull) arr.push({
        name: "None",
        value: null
    });

    return getOptions(query).then(result => {
        for (let i = 0; i < result.length; i++) {
            arr.push({
                name: result[i].name,
                value: result[i].value
            });
        }
        return arr;
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


const exit = () => {
    console.log("Database connection closing...");
    connection.end();
    console.log("Good Bye!");
};

module.exports = inquirerPrompt;