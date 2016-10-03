var path = require("path");

var fileMap = {
    "containing a relative path include statement": "include-relative.asm",
    "with an if statement that evaluates true": "if-true.asm",
    "with an if statement that evaluates false": "if-false.asm",
    "with an if statement that evaluates true with the optional not keywork": "if-not-true.asm",
    "with an if-else statement that evaluates true": "if-else-true.asm",
    "with an if-else statement that evaluates false": "if-else-false.asm"
};

module.exports = function() {
    this.When(/^compiling a file (.*)$/, function (fileDesc, callback) {
        var filePath = fileMap[fileDesc];
        if(filePath === undefined) {
            return callback(null, "pending");
        }

        filePath = path.join(process.cwd(), "features", "data", filePath);
        this.asm.compileFile(filePath);
        callback();
    });

    this.When(/^compiling the line "([^"]*)"$/, function (text, callback) {
        this.asm.compileString(text);
        callback();
    });

    this.When(/^compiling nothing$/, function (callback) {
        this.asm.compileString("");
        callback();
    });
};
