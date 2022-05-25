function help(){
    var command = "";
    console.log("hi");
    if (command.length == 1) {
        msg.reply("Here are the list of commands: $track\n For more information, use $help command")
    } else if (command.length == 2) {
        if (command[1] == "$track") {
            msg.reply("This command tracks the amount of resources spent on an item for a character \nFormat:   $track character_name item_name meso_spent event")
        } else if (command[1] == "$record") {
            msg.reply("This command tracks the user's total spending?")
        }
    }
}

export {help};