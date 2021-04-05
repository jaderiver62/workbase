var connection;

const inquirer = require("inquirer");


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
    }).then(({
        selection
    }) => {
        if (selection === "View Departments") {
            viewDepartments();
            break;
        } else if (selection === "View Roles") {
            viewRoles();
            break;
        } else if (selection === "View Employees") {
            viewEmployees();
            break;
        } else if (selection === "Add New Department") {
            addNewDepartment();
            break;
        } else if (selection === "Add New Role") {
            addNewRole();
            break;
        } else if (selection === "Add New Employee") {
            addNewEmployee();
            break;
        } else if (selection === "Update Employee") {
            updateEmployee();
            break;
        } else {
            close();
        }
    });
};

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
                    message: "Employee's first name:",
                    validate: input => (input) ? true : `Employee records must contain a first name.`
                },
                {
                    type: "input",
                    name: "last_name",
                    message: "Employee's last name:",
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
            insertDatabase("employee", data);
            console.log(`${data.first_name} ${data.last_name} has been added to the database`);
        });
};

const optionQuery = (query, input) => {
    let optionArray = [];
    if (input) optionArray.push({
        name: "None",
        value: null
    });

    return getOptions(query).then(result => {
        for (let i = 0; i < result.length; i++) {
            optionArray.push({
                name: result[i].name,
                value: result[i].value
            });
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
    connection.query(`UPDATE ${table} SET ? WHERE ?`, params, (err, result) => {
        if (err) throw err;
        menu();
    });
};


const viewEmployees = () => accessDatabase(`SELECT e.first_name, e.last_name, title, name AS "department", 
salary, CONCAT(m.first_name, " ", m.last_name) AS "manager" FROM employee e 
JOIN role ON role_id = role.id
JOIN department ON department_id = department.id
LEFT JOIN employee m ON e.manager_id = m.id`);

const viewDepartments = () => accessDatabase(`SELECT * FROM department`);

const viewRoles = () => accessDatabase(`SELECT title, salary, name AS "department" FROM role 
JOIN department ON department_id = department.id`);



const close = () => {
    console.log("Database connection closing...");
    connection.end();
    console.log("Good Bye!");
};