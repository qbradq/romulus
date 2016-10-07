var assert = require("assert");

module.exports = function() {
    this.Then(/^the label "([^"]*)" should be 0x([0-9a-fA-F]+)$/,
        function (name, value, callback) {
        value = parseInt(value, 16);
        var actual = this.asm.resolveLabel(name);
        callback(assert.equal(actual, value,
            "Expected label " + name + " to be allocated to address 0x" +
            ("0000" + value.toString(16)).substr(-4) + " but found 0x" +
            ("0000" + actual.toString(16)).substr(-4)));
    });
};
