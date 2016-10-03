var assert = require("assert");

module.exports = function() {
    this.Then(/^the included file should have been compiled$/, function (callback) {
        callback(assert(this.asm.getFlag("includedFile"),
            "The include-tester.asm file does not appear to have been compiled"));
    });
};
