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

// function which prompts the user for what action they should take
function start() {

    var choice = "";

    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

        for (i = 0; i < res.length; i++) {
            console.log("*-----------*");
            console.log("Product ID: " + res[i].item_id);
            console.log("Product: " + res[i].product_name);
            console.log("Price: $" + res[i].price);
            console.log("Quantity: " + res[i].quantity);
        };

        inquirer.prompt([
            {
                name: "productChoice",
                type: "list",
                choices: function () {
                    var choiceArr = [];
                    for (i = 0; i < res.length; i++) {
                        choiceArr.push(res[i].item_id);
                    }
                    return choiceArr;
                },
                message: "What item would you like to purchase? Please choose from Product ID."
            }, {
                name: "productQuantity",
                type: "input",
                message: "How many would you like to purchase?"
            }
        ]).then(function (answer) {
            choice = answer.productChoice;
            // console.log(answer.quantity)
            var quantityRes = 0;
            for (var i = 0; i < res.length; i++) {
                if (res[i].item_id === answer.productChoice) {
                    quantityRes = parseInt(res[i].quantity - answer.productQuantity);
                }
            };

            console.log(quantityRes);

            // determine if bid was high enough
        if (quantityRes > 0) {
            var total = 0;
            for (i = 0; i < res.length; i++){
                if (res[i].item_id === answer.productChoice){
                    total = res[i].price * answer.productQuantity;
                };
            };
            

            inquirer.prompt(
                {
                    name: "confirm",
                    type: "list",
                    choices: ["Yes", "No"],
                    message: "Your total is: $" + total + ". Would you like to purchase?"

                }
            ).then(function(answer){
                if (answer.confirm === "Yes"){
                    connection.query(
                        "UPDATE products SET ? WHERE ?",
                        [
                          {
                            quantity: quantityRes
                          },
                          {
                            item_id: choice
                          }
                        ],
                        function(error) {
                          if (error) throw error;
                          console.log("Your purchase has been made! Thank you for shopping with Bamazon!");
                          connection.end();
                        }
                      );
                } else {
                    console.log("Sorry to hear that! Please shop with us again.");
                    connection.end();
                };
            });
            
          }
          else {
            // bid wasn't high enough, so apologize and start over
            console.log("Our stock doesn't meet your demand! So sorry...");
            connection.end();
          };

        })

    });

};