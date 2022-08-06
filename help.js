class HelpManager{
    constructor(command, msg){
        this.command = command;
        this.msg = msg;
    }

    handleCommand(){
        if (this.command.length == 1) {
            this.msg.reply("Here are the list of commands: $track, $record\n For more information, use $help command")
        } 
        else if (this.command.length == 2) {
            //$help $track
            if (this.command[1] == "$track") {
                this.msg.reply("The $track command tracks the amount of resources spent\n $track character_name item_name meso_spent event -> This command tracks the amount of resources spent on an item for a character\n \t\tcharacter_name -> The character name being input by the user\n \t\titem_name -> The item being input by the user\n \t\tmeso_spent -> The meso that is being input by the user for that item\n \t\tevent -> The event that is being input by the user")
            }
            //$help $record
            else if (this.command[1] == "$record") {
                this.msg.reply("This $record command tracks the user's records base on the different criteria\n \t\t$record -> returns the user's total spending\n \t\t$record $character -> tracks the user's characters and the amount of meso spent for each character \n \t\t$record character_name -> tracks the character that is being input in the command and gives us the sum of the meso spent along with the different items that are being used\n \t\t$record character_name item_name -> tracks the amount of meso spent on a specific item for that specific character")
            }
            else{
                //Error message if the command is not formatted correctly
                throw "Command is not formatted correctly or does not exist. Please try again!"
            }
        }
        else{
            throw "Command is not formatted correctly or does not exist. Please try again!"
        }      
    }

    handleError(err){
        this.msg.reply(err);
    }
}

export {HelpManager};