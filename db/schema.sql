DROP DATABASE IF EXISTS company;
CREATE DATABASE company;

\c company;

-- Create a department table
CREATE TABLE department (
    id INTEGER PRIMARY KEY,
    name VARCHAR(30)
);

-- Create a role table
CREATE TABLE role (
    id INTEGER PRIMARY KEY,
    title VARCHAR(30),
    salary DECIMAL,
    department_id INTEGER,
    FOREIGN KEY (department_id) REFERENCES department(id)
);

-- Create a employee table
CREATE TABLE employee (
    id INTEGER PRIMARY KEY,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    role_id INTEGER,
    manager_id INTEGER,
    FOREIGN KEY (role_id) REFERENCES role(id),
    FOREIGN KEY (manager_id) REFERENCES employee(id)
);