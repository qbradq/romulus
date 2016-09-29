module.exports = function() {
    this.When(/^assembling an origin directive with the parameter "([^"]*)"$/,
        function (arg1, callback) {
        this.asm.parse("test", "origin " + arg1);
        this.asm.assemble();
        callback();
    });

    this.Then(/^the pc should equal (\d+)$/, function (arg1, callback) {
        if(this.asm.pc !== parseInt(arg1, 10)) {
            callback(new Error("Expected PC to be " + arg1 + " but it was " +
                this.asm.pc));
            return;
        }
        callback();
    });
};
