// Get process.stdin as the standard input object.
let standard_input = process.stdin;

// Set input character encoding.
standard_input.setEncoding("utf-8");

// Prompt user to input data in console.
console.log("Console input module active");

// When user input data and click enter key.
standard_input.on("data", function(data) {

    // User input exit.
    if (data === "exit\n") {
        // Program exit.
        console.log("User input complete, program exit.");
        process.exit();
    } else {
        // Print user input in console.
        console.log("User Input Data : " + data);
    }
});
