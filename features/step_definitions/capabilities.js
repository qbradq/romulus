var assert = require("assert");

module.exports = function() {
    this.Given(/^capability "(busconflict|sram|pal)" is (on|off)$/, function (name, value, callback) {
        callback(this.asm.setCapability(name, value === "on"));
    });

    this.Given(/^capability "(mapper|prgrom|chrrom|)" is (\d+)$/, function (name, value, callback) {
        callback(this.asm.setCapability(name, parseInt(value, 10)));
    });

    this.Then(/^capability "([^"]*)" should be (\d+)$/,
        function (name, value, callback) {
        value = parseInt(value, 10);
        callback(assert(this.asm.getCapability(name) === value,
            "Expected capability " + name + " to be " + value +
            " but it was " + this.asm.getCapability(name)));
    });

    this.Then(/^capability "([^"]*)" should be (true|false)$/,
        function (name, value, callback) {
        var cap = this.asm.getCapability(name);
        callback(assert(cap === (value === "true"),
            "Expected capability " + name + " to be " + value +
            " but it was " + cap.toString()));
    });

    this.Then(/^capability "([^"]*)" should be "([^"]*)"$/,
        function (name, value, callback) {
        var cap = this.asm.getCapability(name);
        callback(assert(cap === value,
            "Expected capability " + name + " to be " + value +
            " but it was " + cap));
    });
};
