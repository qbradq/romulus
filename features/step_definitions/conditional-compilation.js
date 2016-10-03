var assert = require("assert");

module.exports = function() {
    this.Then(/^the "([^"]*)" flag should be (true|false)$/, function (name, value, callback) {
        callback(assert.equal(this.asm.getFlag(name), value === "true",
            "Expected flag " + name + " to be " + value));
    });

    this.Then(/^the code within the if statement should have compiled$/, function (callback) {
        callback(assert(this.asm.getFlag("ifExecuted"),
            "The code within the if statement does not appear to have executed"));
    });

    this.Then(/^the code within the if statement should not have compiled$/, function (callback) {
        callback(assert(!this.asm.getFlag("ifExecuted"),
            "The code within the if statement appears to have executed"));
    });

    this.Then(/^the code within the else statement should have compiled$/, function (callback) {
        callback(assert(this.asm.getFlag("elseExecuted"),
            "The code within the else statement does not appear to have executed"));
    });

    this.Then(/^the code within the else statement should not have compiled$/, function (callback) {
        callback(assert(!this.asm.getFlag("elseExecuted"),
            "The code within the else statement appears to have executed"));
    });
};
