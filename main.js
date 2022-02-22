const { Client, Intents } = require('discord.js');
const dotenv = require("dotenv")
dotenv.config()

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.on("ready", () => {
	console.log("The bot is ready!")
})

client.on("message", msg => {
	if (msg.content == "ping") {
		msg.reply("pong");
	}
})

client.login(process.env.TOKEN)