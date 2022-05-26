import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { help } from './help.js';
import {Record} from './record.js';
import {track} from './track.js';
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
    var command = msg.content.split(" ");
    // tracking
        if (command[0] == "$track") {
            // track();
            if (validateTrack(command)) { 
                // Determine what info to put in

                var ownerId = msg.author.id
                var characterName = command[1]
                var itemName = command[2]
                var mesoSpent = command[3]
                var sfEvent = ""
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
            msg.reply("Here are the list of commands: $track, $record\n For more information, use $help command")
        } 
        else if (command.length == 2) {
            if (command[1] == "$track") {
                msg.reply("The $track command tracks the amount of resources spent\n $track character_name item_name meso_spent event -> This command tracks the amount of resources spent on an item for a character\n \t\tcharacter_name -> The character name being input by the user\n \t\titem_name -> The item being input by the user\n \t\tmeso_spent -> The meso that is being input by the user for that item\n \t\tevent -> The event that is being input by the user")
            } 
            else if (command[1] == "$record") {
                msg.reply("This $record command tracks the user's records base on the different criteria\n \t\t$record -> returns the user's total spending\n \t\t$record $character -> tracks the user's characters and the amount of meso spent for each character \n \t\t$record character_name -> tracks the character that is being input in the command and gives us the sum of the meso spent along with the different items that are being used\n \t\t$record character_name item_name -> tracks the amount of meso spent on a specific item for that specific character")
            }
        }
    }
    // $record is use to look up user's track record
	else if (command[0] == "$record") {
        if (validateRecord(command)) {
            ownerId = msg.author.id;
            if (command.length == 1) {
				 // total meso spent with the owner id
                var botReply = "";
                connection.query("SELECT character_name, SUM(meso_spent) FROM item WHERE owner_id = " + ownerId + " group by character_name", function (err, res) {
                    if (err) 
                        throw err;
                    
                    var results = JSON.parse(JSON.stringify(res));
                    let sum = 0;
                    let character = "";
                    //message for no records with the user's owner ID
                    if(results.length == 0){
                        msg.reply("There are no records in the database with your owner ID");
                        // Record();
                        // console.log(Record());
                    }
                    else{
                        for (var i = 0; i < results.length; i++) {
                            sum += results[i]["SUM(meso_spent)"];
                            character +=  results[i]["character_name"] + " ," ;
                        }
                        //substring to get rid of the , at the end of the statement
                        character = character.substring(0, character.length-2);
                        botReply = "Meso Spent: " + sum + "\n" + "Character Name: " + character;
                        msg.reply(botReply);
                    }
                })
            }else if (command.length == 2) { 
                // $record $character
				// record character tracks the character and the amount of meso spent
                if (command[1] == "$character") {
                    connection.query("SELECT DISTINCT character_name,SUM(meso_spent) from item WHERE owner_id = " + ownerId + " group by character_name", function (err, res) {
                        if (err) 
                            throw err;
                        
                        var characterMeso = JSON.parse(JSON.stringify(res));
						var botMeso = "";
                        // If the user doesn's have any entries in the database the bot will return a message saying 
                        // the user doesn't have any information
                        if(characterMeso.length == 0 ){
                            msg.reply("There is no entries in the database.");
                        }
                        else{
                            for (var i = 0; i < characterMeso.length; i++) {
                                botMeso += "Character Name: " + characterMeso[i]["character_name"] + "\n" + "Meso spent: " + characterMeso[i]["SUM(meso_spent)"] + "\n" ;
                            }
                            msg.reply(botMeso);
                        }
                    })
                }
				else{
                    // $Record character_name 
                    // Give the record of the character that is being input in the command and gives us the sum of the meso spent 
                    // as well as the items that were being used.
					connection.query("SELECT DISTINCT character_name, SUM(meso_spent), item_name from item WHERE owner_id = " + ownerId + " " + "AND character_name = '" + command[1] +  "' group by character_name, item_name" , function (err, res) {
						if(err)
                            throw err;
						var characterMeso = JSON.parse(JSON.stringify(res));
                        if(characterMeso.length == 0){
                            msg.reply("There is no character name in the database");
                        }
                        else{
                            let sum = 0;
                            let items = "";
                            for(var i = 0; i < characterMeso.length; i++){ 
                                sum += characterMeso[i]["SUM(meso_spent)"];
                                items += characterMeso[i]["item_name"] + ", ";
                            }
                            items = items.substring(0, items.length-2);
                            msg.reply("Character Name: " + characterMeso[0]["character_name"] + "\n" + "Meso spent: " + sum + "\n" + "Items: " + items);
                        }
					})
				}
            }
			 // record item tracks the character and how much they spend on an item 
			 // character name and item name
			else if(command.length == 3) {
				//$record command[1] == character_name command[2] == item_name
				// keeps track of meso spent on the specific item
					connection.query("SELECT character_name, meso_spent, item_name from item  WHERE owner_id = " + ownerId + " " + " AND character_name = '" + command[1] +  "'  AND item_name = '" + command[2] + "' group by character_name", function (err, res) {
						if (err) 
							throw err;
							characterItem = JSON.parse(JSON.stringify(res));
                            //if the command doesn't have the character name or item name 
                            if(characterItem.length == 0){
                                msg.reply("The database doesn't have the item name or character name");
                            }
                            else
							    msg.reply("Item Name: " + characterItem[0]["item_name"] + "\n" + "Character Name: " + characterItem[0]["character_name"] + "\n" + "Meso spent: " + characterItem[0]["meso_spent"] + "\n")
                            
                    })
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
