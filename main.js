const { Client, Intents, Message } = require('discord.js');
const dotenv = require("dotenv");
const fs = require("fs");
const cron = require("cron");
const mysql = require("mysql");
dotenv.config()
//connection
var connection = mysql.createConnection({
	host: 'localhost',
	port: '3306',
	user:  process.env.USER,
	database: process.env.DATABASE,
	password: process.env.PASSWORD
})

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
var users = []

client.on("ready", () => {
	//Crafting reminder function
	fs.readFile("users.txt", "utf8", (err,data) => {
		if (err) {
			console.log("Unable to retrieve users");
			console.log(error)
			return
		}
		users = data.split(" ");
		var job = new cron.CronJob("0 0 17 * * *", () => {
			reply = ""
			for (var i = 0; i < users.length; i++){
				reply += "<@" + users[i] + "> "
			}
			reply += "\n Daily Reminder: Remember to do your crafting, Hellux, Ursus and Cernium/Hotel"
		
			client.channels.cache.get("945800238587838534").send(reply)
		});
		job.start();
	});
	//server is connected if not error
	connection.connect(function(err){
		if(err)throw err;
		console.log("success");
	})
	console.log("The bot is ready!")
})

//tracking cost and pain
client.on("message", msg => {
	command = msg.content.split(" ");
	//tracking
	if (command[0] == "$track") {
		if (validateTrack(command)){
			msg.reply("Command is valid and track your starforcing (not implemented yet)")
		}else{
			msg.reply("Command is invalid; Please check if you put in your info correctly")
		}
	}
	//this command gives information the other commands
	else if (command[0] == "$help"){
		//Display list of commands
		//length with help command
		if (command.length == 1){
			msg.reply("Here are the list of commands: $track\n For more information, use $help command")
		}else if (command.length == 2 ) {
			if (command[1] == "$track") {
				msg.reply("This command tracks the amount of resources spent on an item for a character \nFormat:   $track character_name item_name meso_spent event booms")
			}
			else if (command[1] == "$record"){
				msg.reply("This command tracks the user's total spending?")
			}
		}
	}
	//looking up user's track record
	// $record character_name_ 
	else if (command[0] == "$record"){
		connection.query("SELECT * FROM `character`", function(err, res){
			if(err) throw err;
			results = JSON.parse(JSON.stringify(res));
			// console.log(results);
			msg.reply("ID: " + results[0].id);
		});
	}
})


/**
* Returns true or false if the command is in valid format
*
* @param {string} command the string being validated
*/
function validateTrack(command){
	if (command.length != 6){
		return false
	}
	
	if (isNaN(command[5])){
		return false
	}
	
	return true
}

client.login(process.env.TOKEN)