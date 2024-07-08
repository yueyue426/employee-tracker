const inquirer = require('inquirer');
const db = require('./src/db');

const questions = [
    {
        type: 'list',
        name: 'actions',
        message: 'What would you like to do?',
        choices: [
            'View all departments',
            'View all roles',
            'View all employees',
            'Add a department',
            'Add a role',
            'Add an employee',
            'Update an employee role',
            'Exit',
        ],
    }
]

function init() {
    inquirer.prompt(questions).then((responses => {
        let action = responses.actions;
        switch (action) {
            case 'View all departments':
                viewDepartments();
                break;
            case 'View all roles':
                viewRoles();
                break;
            case 'View all employees':
                viewEmployees();
                break;
            case 'Add a department':
                addDepartment();
                break;
            case 'Add a role':
                addRole();
                break;
            case 'Add an employee':
                addEmployee();
                break;
            case 'Update an employee role':
                updateEmployeeRole();
                break;
            case 'Exit':
                process.exit();
        }
    }));
}

function viewDepartments() {
    db.query('SELECT * FROM department', function (err, res) {
        if (err) throw err;
        console.table(res.rows);
        init();
    });
}

function viewRoles() {
    db.query('SELECT * FROM role', function (err, res) {
        if (err) throw err;
        console.table(res.rows);
        init();
    });
}

function viewEmployees() {
    db.query('SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, employee.manager_id FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id', 
        function (err, res) {
        if (err) throw err;
        console.table(res.rows);
        init();
    });
}

function addDepartment() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'department',
            message: 'What is the name of the department?'
        }]
    ).then((answer => {
        db.query('INSERT INTO department (name) VALUES ($1)', [answer.department], (err, res) => {
            if (err) throw err;
            console.log(`Added ${answer.department} to the database.`);
            init();
        });
    }));
}

function addRole() {
    db.query('SELECT * FROM department', function (err, res) {
        if (err) throw err;
        const departmentChoices = res.rows.map(dept => ({ name: dept.name, value: dept.id}));

        inquirer.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'What is the name of the role?'
            },
            {
                type: 'input',
                name: 'salary',
                message: 'What is the salary of the role?'
            },
            {
                type: 'list',
                name: 'department',
                message: 'Which department does the role belong to?',
                choices: departmentChoices
            }
        ]).then((answers) => {
            db.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)',
                [answers.name, answers.salary, answers.department], (err, res) => {
                    if (err) throw err;
                    console.log(`Added ${answers.name} to the database.`);
                    init();
                }
            );
        });
    });
}

function addEmployee() {
    db.query('SELECT * FROM role', function (err, res) {
        if (err) throw err;
        const roleChoices = res.rows.map(role => ({ name: role.title, value: role.id }))

        db.query('SELECT * FROM employee', function (err, res) {
            if (err) throw err;
            const managerChoices = res.rows.map(manager => ({ name: `${manager.first_name} ${manager.last_name}`, value: manager.manager_id}));

            inquirer.prompt([
                {
                    type: 'input',
                    name: 'first_name',
                    message: 'What is the employee\'s first name?'
                },
                {
                    type: 'input',
                    name: 'last_name',
                    message: 'What is the employee\'s last name?'
                },
                {
                    type: 'list',
                    name: 'role',
                    message: 'What is the employee\'s role?',
                    choices: roleChoices
                },
                {
                    type: 'list',
                    name: 'manager',
                    message: 'Who is the employee\'s manager?',
                    choices: managerChoices
                }
            ]).then((answers) => {
                db.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)',
                    [answers.first_name, answers.last_name, answers.role, answers.manager], (err, res) => {
                        if (err) throw err;
                        console.log(`Added ${answers.first_name} ${answers.last_name} to the database.`);
                        init();
                    }
                )
            });
        });
    });
}

function updateEmployeeRole() {
    db.query('SELECT * FROM employee', function (err, res) {
        if (err) throw err;
        const employeeChoices = res.rows.map(employee => ({ 
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id}));

        db.query('SELECT * FROM role', function (err, res) {
            if (err) throw err;
            const roleChoices = res.rows.map(role => ({ 
                name: role.title, 
                value: role.id }));
            
            inquirer.prompt([
                {
                    type: 'list',
                    name: 'employeeId',
                    message: 'Which employee\'s role would you like to update?',
                    choices: employeeChoices
                },
                {
                    type: 'list',
                    name: 'roleId',
                    message: 'Which role do you want to assign the selected employee?',
                    choices: roleChoices
                }
            ]).then((answers) => {
                // Find employee name and role name
                const employeeName = employeeChoices.find(emp => emp.value === answers.employeeId).name;
                const employeeRole = roleChoices.find(role => role.value === answers.roleId).name;
                // Update employee role
                db.query('UPDATE employee SET role_id = $1 WHERE id = $2',
                    [answers.roleId, answers.employeeId], (err, res) => {
                        if (err) throw err;
                        console.log(`Updated ${employeeName} to ${employeeRole} in the database.`);
                        init();
                    }
                );
            });
        });
    });
}

init();