    class TrackManager{
        constructor(connection,command, msg){
            this.connection = connection;
            this.command = command;
            this.msg = msg;
        }
        validateCommand(){
            //Returns true or false if the command is in valid format   
            if (this.command.length < 4) {
                return false
            }
            if (isNaN(this.command[3])) {
                return false
            }
            // event
            if (this.command.length == 5) {
                var events = ["offevent", "5/10/15", "30%", "Shiny"]
                if (events.indexOf(this.command[4]) == -1) {
                    return false;
                }
            }
            return true;
        }
        handleCommand(){
            var ownerId = this.msg.author.id;
            var characterName = this.command[1];
            var itemName = this.command[2];
            var mesoSpent = this.command[3];
            var sfEvent = "";
            if (this.command.length <= 4) {
                sfEvent = "offevent"
            } else {
                sfEvent = this.command[4]
            }
            // Make SQL statement
            var statement = "INSERT INTO item (owner_id, character_name, item_name, meso_spent, event) VALUES ('" + ownerId + "','" + characterName + "', '" + itemName + "', '" + mesoSpent + "', '" + sfEvent + "')"
            var msg = this.msg;
            // Insert into Database
            this.connection.query(statement, function (err, res){
                if (err) 
                    throw err
                msg.reply("Command is valid and is logged in the database");
            });
            this.msg.reply("Format is invalid. Please Try Again!")
        }
        handleError(err){
            this.msg.reply(err);
        }
    }

export {TrackManager};