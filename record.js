class RecordManager{
    constructor(connection, command, msg){
        this.connection = connection;
        this.command = command;
        this.msg = msg;
    }
    validateCommand(){
        //Returns true or false if the command is in a valid format
        return true;
    }
    handleCommand(){
        var ownerId = this.msg.author.id;
        if (this.command.length == 1) {
                // total meso spent with the owner id
            var botReply = "";
            var msg = this.msg;
            this.connection.query("SELECT character_name, SUM(meso_spent) FROM item WHERE owner_id = " + ownerId + " group by character_name", function (err, res) {
                if (err) 
                    throw err;
                var results = JSON.parse(JSON.stringify(res));
                let sum = 0;
                let character = "";
                //message for no records with the user's owner ID
                if(results.length == 0){
                    msg.reply("There are no records in the database with your owner ID");
                }
                else{
                    for (var i = 0; i < results.length; i++) {
                        sum += results[i]["SUM(meso_spent)"];
                        character +=  results[i]["character_name"] + ", " ;
                    }
                    //substring to get rid of the , at the end of the statement
                    character = character.substring(0, character.length-2);
                    botReply = "Meso Spent: " + sum + "\n" + "Character Name: " + character;
                    msg.reply(botReply);
                }
            })
        }
        else if (this.command.length == 2) { 
            // $record $character
            // record character tracks the character and the amount of meso spent
            if (this.command[1] == "$character") {
                var msg = this.msg;
                this.connection.query("SELECT DISTINCT character_name,SUM(meso_spent) from item WHERE owner_id = " + ownerId + " group by character_name", function (err, res) {
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
                var msg = this.msg;
                this.connection.query("SELECT DISTINCT character_name, SUM(meso_spent), item_name from item WHERE owner_id = " + ownerId + " " + "AND character_name = '" + this.command[1] +  "' group by character_name, item_name" , function (err, res) {
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
        else if(this.command.length == 3) {
            //$record command[1] == character_name command[2] == item_name
            // keeps track of meso spent on the specific item
                var msg = this.msg;
                this.connection.query("SELECT character_name, meso_spent, item_name from item  WHERE owner_id = " + ownerId + " " + " AND character_name = '" + this.command[1] +  "'  AND item_name = '" + this.command[2] + "' ", function (err, res) {
                    if (err) 
                        throw err;
                        var characterItem = JSON.parse(JSON.stringify(res));
                        //if the command doesn't have the character name or item name 
                        if(characterItem.length == 0){
                            msg.reply("The database doesn't have the item name or character name");
                        }
                        else{
                            let sum = 0;
                            for(var i = 0; i < characterItem.length; i++){
                                sum += characterItem[i]["meso_spent"];
                            }
                            msg.reply("Character Name: " + characterItem[0]["character_name"] + "\n" + "Item Name: " + characterItem[0]["item_name"] + "\n" + "Meso spent: " + sum )
                        }
                })
        }

    }
    handleError(err){
        this.msg.reply(err);
    }
}

export {RecordManager};