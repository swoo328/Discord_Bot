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
	if (msg.content == "dailyreminder") {
		reply = ""
		for (var i = 0; i < users.length; i++){
			reply += "<@" + users[i] + "> "
		}
		reply += "\n Daily Reminder: Remember to do your crafting, Hellux, and Cernium/Hotel"
		msg.channel.send(reply);
	}
})

client.login(process.env.TOKEN)