var mysql = require("mysql");

var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "root",
    database: "bamazon_db"
});

// connect to the mysql server and sql database
connection.connect(function (err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    start();
});

function start() {

    inquirer.prompt([
        {
            name: 'username',
            type: "input",
            message: "Manager Username: "
        }, {
            name: "password",
            type: "input",
            message: "Manager Password: "
        }
    ]).then(function (answer) {
        connection.query("SELECT * FROM managers", function (err, res) {

            if (err) throw err;

            var permission = false;

            for (i = 0; i < res.length; i++) {
                if (answer.username === res[i].username && answer.password === res[i].password) {
                    permission = true;
                    break;
                }
            };
            if (permission === false) {
                console.log("Your input does not match our database credentials!");
                connection.end();
            } else if (permission === true) {
                inquirer.prompt(
                    {
                        name: "initialize",
                        type: "list",
                        choices: ["View available products", "View low inventory", "Add inventory", "Add new product", "Add new manager", "exit"],
                        message: "What would you like to do?"
                    }).then(function (answer) {

                        if (answer.initialize === "View available products") {
                            viewProducts();
                            connection.end();
                        } else if (answer.initialize === "View low inventory") {
                            lowInventory();
                            connection.end();
                        } else if (answer.initialize === "Add inventory") {
                            addInventory();
                        } else if (answer.initialize === "Add new product") {
                            newProduct();
                        } else if (answer.initialize === "Add new manager") {
                            newManager();
                        } else {
                            console.log("You have exited Manager controls!");
                            connection.end();
                        }
                    })
            }
        });
    });


};

function viewProducts() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

        for (i = 0; i < res.length; i++) {
            console.log("*-----------*");
            console.log("Product ID: " + res[i].item_id);
            console.log("Product: " + res[i].product_name);
            console.log("Price: $" + res[i].price);
            console.log("Quantity: " + res[i].quantity);
        };
    });
};

function lowInventory() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

        for (i = 0; i < res.length; i++) {
            if (res[i].quantity < 10) {
                console.log("*-----------*");
                console.log("Product ID: " + res[i].item_id);
                console.log("Product: " + res[i].product_name);
                console.log("Price: $" + res[i].price);
                console.log("Quantity: " + res[i].quantity);
            };
        };

    });
};

var choiceAdd = 0;

function addInventory() {

    viewProducts();
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        inquirer.prompt({
            name: "productChoice",
            type: "list",
            choices: function () {
                var choiceArr = [];
                for (i = 0; i < res.length; i++) {
                    choiceArr.push(res[i].item_id);
                }
                return choiceArr;
            },
            message: "Choose Product ID you'd like to add inventory to."
        }).then(function (answer) {
            choiceAdd = parseInt(answer.productChoice);
            inquirer.prompt({
                type: "input",
                name: "add",
                message: "How much would you like to add the inventory?"
            }).then(function (answer) {
                var newInventory = 0;

                for (i = 0; i < res.length; i++) {
                    if (res[i].item_id === choiceAdd) {
                        newInventory = res[i].quantity + parseInt(answer.add);
                    }
                }
                connection.query("UPDATE products SET ? WHERE ?",
                    [{
                        quantity: newInventory
                    },
                    {
                        item_id: choiceAdd
                    }], function (err) {
                        if (err) throw err;

                        console.log("Product inventory has been added");
                        connection.end();

                    });
            });

        });
    });

};

function newProduct() {
    inquirer.prompt([
        {
            name: "name",
            type: "input",
            message: "What type of product would you like?"
        }, {
            name: "price",
            type: "input",
            message: "What price would you like to give this product?"
        }, {
            name: "quantity",
            type: "input",
            message: "Quantity of this product?"
        }
    ]).then(function (answer) {
        var productName = answer.name;
        var productPrice = parseInt(answer.price);
        var productQuantity = parseInt(answer.quantity);

        connection.query("INSERT INTO products SET ?",
            {
                product_name: productName,
                price: productPrice,
                quantity: productQuantity
            }, function (err, res) {
                if (err) throw err;

                console.log(res.affectedRows + " product inserted!\n");
                connection.end();
            })
    });
};

function newManager() {
    var passwordArray = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 1, 2, 3, 4, 5, 6, 7, 8, 9];

    var passwordNew = [];

    for (i = 0; i < 10; i++) {
        var randomizer = Math.floor(Math.random() * passwordArray.length)
        passwordNew.push(passwordArray[randomizer])
    };

    console.log(passwordNew.join(""));

    inquirer.prompt({
        name: "manager",
        type: "input",
        message: "New manager username?"
    }).then(function (answer) {
        connection.query("INSERT INTO managers SET ?", {
            username: answer.manager,
            password: passwordNew.join("")
        }, function (err, res) {
            if (err) throw err;

            console.log(res.affectedRows + " manager(s) inserted!\n");
            connection.end();

        })
    })
}