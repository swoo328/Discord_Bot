const { Client, Intents } = require('discord.js');
const dotenv = require("dotenv")
const fs = require("fs")
const cron = require("cron")
dotenv.config()

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
var users = []

client.on("ready", () => {
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

	console.log("The bot is ready!")
})


client.on("message", msg => {
	content = msg.content.split(" ")
	if (content[0] == "$track") {
		if (validateTrack(content)){
			msg.reply("Command is valid and track your starforcing (not implemented yet)")
		}else{
			msg.reply("Command is invalid; Please check if you put in your info correctly")
		}
	}
	else if (content[0] == "$help"){
		//Display list of commands
		if (content.length == 1){
			msg.reply("Here are the list of commands: $track\n For more information, use $help command")
		}else if (content.length == 2) {
			if (content[1] == "$track") {
				msg.reply("This command tracks the amount of resources spent on an item for a character \nFormat:   $track character_name item_name meso_spent event booms")
			}
		}
	}
})


/**
* Returns true or false if the content is in valid format
*
* @param {string} content the string being validated
*/
function validateTrack(content){
	if (content.length != 6){
		return false
	}
	
	if (isNaN(content[5])){
		return false
	}
	
	return true
}

client.login(process.env.TOKEN)