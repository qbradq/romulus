var Label = require("../../src/label");

module.exports = function() {
    this.Given(/^label "([^"]*)" equals "([^"]*)"$/, function (name, value, callback) {
        var l = new Label(name, parseInt(value, 10));
        console.log(l);
        this.asm.registerLabel(l);
        callback();
    });
    
    this.Given(/^the pc is (\d+)$/, function (pc, callback) {
        this.asm.pc = parseInt(pc, 10);
        callback();
    });

    this.When(/^assembly completes$/, function (callback) {
        this.asm.assemble();
        callback();
    });
    
    this.Then(/^no action should be taken$/, function (callback) {
        // Nothing to check yet
        callback();
    });
};
