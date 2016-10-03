var assert = require("assert");

module.exports = function() {
    this.Given(/^capability "(busconflict|sram|pal)" is (on|off)$/, function (name, value, callback) {
        callback(this.asm.setCapability(name, value === "on"));
    });

    this.Given(/^capability "(mapper|prgrom|chrrom)" is (\d+)$/, function (name, value, callback) {
        callback(this.asm.setCapability(name, parseInt(value, 10)));
    });

    this.When(/^setting capability "([^"]*)" to "([^"]*)"$/,
        function (name, value, callback) {
        if(value === "on") {
            value = true;
        } else if(value === "off") {
            value = false;
        } else if(value.match(/^\d+$/)) {
            value = parseInt(value, 10);
        }
        callback(this.asm.setCapability(name, value));
    });

    this.Then(/^capability "([^"]*)" should be "([^"]*)"$/,
        function (name, value, callback) {
        if(value === "true") {
            value = true;
        } else if(value === "false") {
            value = false;
        }
        callback(assert(this.asm.getCapability(name) == value,
            "Expected capability " + name + " to be " + value +
            " but it was " + this.asm.getCapability(name)));
    });
};
