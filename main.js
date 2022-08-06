import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import {HelpManager} from './help.js';
import {RecordManager} from './record.js';
import {TrackManager} from './track.js';
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
        var tracker = new TrackManager(connection, command, msg);
        try{
            tracker.handleCommand();
        }
        catch(e){
            tracker.handleError(e);
        }
    }   
    // this command gives information the other commands 
	else if (command[0] == "$help") {
        // Display list of commands
        // length with help command
        var manager = new HelpManager(command, msg);
        try{
            manager.handleCommand();
        }
        catch(e){
            manager.handleError(e);
        }
    }
    // $record is use to look up user's track record
	else if (command[0] == "$record") {
        var record = new RecordManager(connection, command, msg);
        try{
            record.handleCommand();
        }
        catch(e){
            record.handleError(e);
        }
    }
    
})

client.login(process.env.TOKEN)
