module.exports = function() {
    this.When(/^a positional definition for label "([^"]*)" is encountered$/, function (name, callback) {
        this.asm.parse("test", name + ":");
        callback();
    });

    this.When(/^a litteral definition for label "([^"]*)" at address "([^"]*)" is encountered$/,
        function (name, value, callback) {
        this.asm.parse("test", "define " + name + " " + value);
        callback();
    });
    
    this.Then(/^label "([^"]*)" should equal (\d+)$/, function (name, value, callback) {
        value = parseInt(value, 10);
        var label = this.asm.findLabel(name);
        if(!label) {
            callback(new Error("Label " + name + " does not exist"));
            return;
        }
        if(label.getValue() !== value) {
            callback(new Error("Label " + name + " has value " + label.getValue() +
                " but expected " + value));
            return;
        }
        callback();
    });
};
