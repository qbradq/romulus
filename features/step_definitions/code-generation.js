var assert = require("assert");

module.exports = function() {
    this.Then(/^the compiled output should be "([^"]*)"$/,
        function (hex, callback) {
        var length = hex.length / 2;

        var value = "";
        for(var i = 0; i < length; ++i) {
            var byte = this.asm.prgrom.buffer.readUInt8(i);
            value += ("00" + byte.toString(16)).substr(-2);
        }

        value = value.toUpperCase();
        hex = hex.toUpperCase();
        callback(assert.equal(hex, value, "Expected " + hex +
            " but found " + value));
    });
};
