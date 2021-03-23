const accessDatabase = connection => {
    connection.query("CREATE DATABASE IF NOT EXISTS employeeDB", (err, result) => {
        if (err) throw err;
    });

    connection.query("USE employeeDB", (err, result) => {
        if (err) throw err;
    });

    connection.query(`CREATE TABLE IF NOT EXISTS department (
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(30) NOT NULL,
        PRIMARY KEY (id)
        )`, (err, result) => {
        if (err) throw err;
    });

    connection.query(`CREATE TABLE IF NOT EXISTS role (
        id INT NOT NULL AUTO_INCREMENT,
        title VARCHAR(30) NOT NULL,
        salary DECIMAL NOT NULL,
        department_id INT NOT NULL,
        PRIMARY KEY (id),
        CONSTRAINT fk_department FOREIGN KEY (department_id) REFERENCES department(id) ON DELETE CASCADE
        )`, (err, result) => {
        if (err) throw err;
    });

    connection.query(`CREATE TABLE IF NOT EXISTS employee (
        id INT NOT NULL AUTO_INCREMENT,
        first_name VARCHAR(30) NOT NULL,
        last_name VARCHAR(30) NOT NULL,
        role_id INT NOT NULL,
        manager_id INT,
        PRIMARY KEY (id),
        CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE CASCADE,
        CONSTRAINT fk_manager FOREIGN KEY (manager_id) REFERENCES employee(id) ON DELETE SET NULL
        )`, (err, result) => {
        if (err) throw err;
    });
};


module.exports = accessDatabase;