const {Client, Intents, Message} = require('discord.js');
const dotenv = require("dotenv");
const fs = require("fs");
const cron = require("cron");
const mysql = require("mysql");
dotenv.config()
// connection
var connection = mysql.createConnection({
    host: process.env.HOST,
    port: process.env.PORT,
    user: process.env.USER,
    database: process.env.DATABASE,
    password: process.env.PASSWORD
})

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});
var users = []

client.on("ready", () => { // Crafting reminder function
    fs.readFile("users.txt", "utf8", (err, data) => {
        if (err) {
            console.log("Unable to retrieve users");
            console.log(error)
            return
        }
        users = data.split(" ");
        var job = new cron.CronJob("0 0 17 * * *", () => {
            reply = ""
            for (var i = 0; i < users.length; i++) {
                reply += "<@" + users[i] + "> "
            }
            reply += "\n Daily Reminder: Remember to do your crafting, Hellux, Ursus and Cernium/Hotel"

            client.channels.cache.get("945800238587838534").send(reply)
        });
        job.start();
    });
    // server is connected if not error
    connection.connect(function (err) {
        if (err) 
            throw err;
        
        console.log("success");
    })
    console.log("The bot is ready!")
})

// tracking cost and pain
client.on("message", msg => {
    command = msg.content.split(" ");
    // tracking
    if (command[0] == "$track") {
        if (validateTrack(command)) { // Determine what info to put in
            ownerId = msg.author.id
            characterName = command[1]
            itemName = command[2]
            mesoSpent = command[3]
            sfEvent = ""
            if (command.length <= 4) {
                sfEvent = "offevent"
            } else {
                sfEvent = command[4]
            }

            // Make SQL statement
            statement = "INSERT INTO item (owner_id, character_name, item_name, meso_spent, event) VALUES ('" + ownerId + "','" + characterName + "', '" + itemName + "', '" + mesoSpent + "', '" + sfEvent + "')"

            // Insert into Database
            connection.query(statement, function (err, res) {
                if (err) 
                    throw err
                
                msg.reply("Command is valid and is logged in the database")
            });

        } else {
            msg.reply("Command is invalid; Please check if you put in your info correctly")
        }
    }
    // this command gives information the other commands 
	else if (command[0] == "$help") {
        // Display list of commands
        // length with help command
        if (command.length == 1) {
            msg.reply("Here are the list of commands: $track\n For more information, use $help command")
        } else if (command.length == 2) {
            if (command[1] == "$track") {
                msg.reply("This command tracks the amount of resources spent on an item for a character \nFormat:   $track character_name item_name meso_spent event")
            } else if (command[1] == "$record") {
                msg.reply("This command tracks the user's total spending?")
            }
        }
    }
    // looking up user's track record
    // $record character_name_ 
	else if (command[0] == "$record") {
        if (validateRecord(command)) {
            ownerId = msg.author.id;
            if (command.length == 1) {
				 // total meso spent with the owner id
                botReply = "";
                connection.query("SELECT SUM(meso_spent) AS total FROM item WHERE owner_id = " + ownerId, function (err, res) {
                    if (err) 
                        throw err;
                    
                    results = JSON.parse(JSON.stringify(res));
                    botReply = "MESO SPENT: " + results[0].total + "\n";
                })
                // the characters related to the owner id
                connection.query("SELECT DISTINCT character_name FROM item WHERE owner_id = " + ownerId, function (err, res) {
                    if (err) 
                        throw err;
                    
                    character = JSON.parse(JSON.stringify(res));
                    for (var i = 0; i < character.length; i++) {
                        botReply += "Character Name: " + character[i]["character_name"] + "\n";
                    }
                    msg.reply(botReply);
                    // return the money spent on the character
                });

            } else if (command.length == 2) { // record character tracks the character and the amount of meso spent
                if (command[1] == "$character") {
                    connection.query("SELECT DISTINCT character_name,SUM(meso_spent) from item WHERE owner_id = " + ownerId + " group by character_name", function (err, res) {
                        if (err) 
                            throw err;
                        
                        characterMeso = JSON.parse(JSON.stringify(res));
                        for (var i = 0; i < characterMeso.length; i++) {
                            msg.reply("Character Name: " + characterMeso[i]["character_name"] + "\n" + "Meso spent: " + characterMeso[i]["SUM(meso_spent)"] + "\n")
                        }
                    })
                }
				else{
					connection.query("SELECT DISTINCT character_name, SUM(meso_spent) from item WHERE owner_id = " + ownerId + " " + "AND character_name = '" + command[1] +  "' group by character_name" , function (err, res) {
						if(err)
							throw err;
						characterMeso = JSON.parse(JSON.stringify(res));
						msg.reply("Character Name: " + characterMeso[0]["character_name"] + "\n" + "Meso spent: " + characterMeso[0]["SUM(meso_spent)"] + "\n");
					})
				}
            }
			 // record item tracks the character and how much they spend on an item 
			 // character name and item name
			else if(command.length == 3) {
				if(command[1] == "character" && command[2] == "items"){
					connection.query("SELECT character_name, meso_spent, item_name from item  WHERE owner_id = " + ownerId, function (err, res) {
						if (err) 
							throw err;
							characterItem = JSON.parse(JSON.stringify(res));
							for (var i = 0; i < characterItem.length; i++) {
								msg.reply("Item Name: " + characterItem[i]["item_name"] + "\n" + "Character Name: " + characterItem[i]["character_name"] + "\n" + "Meso spent: " + characterItem[i]["meso_spent"] + "\n")
							}
						})
				}
				else if(command[2] == "items"){
					connection.query("SELECT character_name, item_name from item  WHERE owner_id = " + ownerId + " " + " AND character_name = '" + command[1]  + "'" , function (err, res) {
						if (err) 
							throw err;
							characterItem = JSON.parse(JSON.stringify(res));
							console.log(characterItem);
							for (var i = 0; i < characterItem.length; i++) {
								msg.reply("Character Name: " + characterItem[i]["character_name"] + "\n" +  "Item Name: " + characterItem[i]["item_name"] + "\n" );
							}	
					})
				}
				else{
					connection.query("SELECT character_name, meso_spent, item_name from item  WHERE owner_id = " + ownerId + " " + " AND character_name = '" + command[1] +  "'  AND item_name = '" + command[2] + "' group by character_name", function (err, res) {
						if (err) 
							throw err;
							characterItem = JSON.parse(JSON.stringify(res));
							msg.reply("Item Name: " + characterItem[0]["item_name"] + "\n" + "Character Name: " + characterItem[0]["character_name"] + "\n" + "Meso spent: " + characterItem[0]["meso_spent"] + "\n")
					})
				}
			}

        }
    }
    
})


/**
* Returns true or false if the command is in valid format
*
* @param {string} command the string being validated
*/
function validateTrack(command) {
    if (command.length < 4) {
        return false
    }

    if (isNaN(command[3])) {
        return false
    }

    // event
    if (command.length == 5) {
        events = ["offevent", "5/10/15", "30%", "Shiny"]
        if (events.indexOf(command[4]) == -1) {
            return false
        }
    }

    return true
}

function validateRecord(command) {
   return true;
}

client.login(process.env.TOKEN)
