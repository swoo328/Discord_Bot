    function track(){
        
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

export {track};