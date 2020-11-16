import { Runner } from "Runner";
import * as readline from "readline";
import { Logger } from "utility/Logger";

// Prompt user to input data in console.
Logger.verbose("Console input module active");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// When user input data and click enter key.
rl.on("line", async function (data)
{
    // User input exit.
    if (data === "exit") {
        // Program exit.
        Logger.verbose("User input complete, program exit.");
        process.exit();
    } else if (data === "turn") {
        await Runner.Turn();
    }
});