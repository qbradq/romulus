var assert = require("assert");

module.exports = function() {
    this.Then(/^the label "([^"]*)" should be allocated in the (ZEROPAGE|WRAM|SRAM) segment$/,
        function (name, segment, callback) {
        var label = this.asm.getLabel(name);

        if(!label) {
            return callback(new Error("Label " + name + " is not defined"));
        }

        switch(segment) {
            case "ZEROPAGE":
                return callback(assert(
                    label.value >= 0x0000 &&
                    label.value <= 0x00FF,
                    "Label " + name + " was not allocated in zeropage, " +
                    "address was " + (label.value === undefined ? "undefined" :
                    "0x" + ("0000" + label.value.toString(16).substr(-4)))
                ));
            case "WRAM":
                return callback(assert(
                    label.value >= 0x0300 &&
                    label.value <= 0x07FF,
                    "Label " + name + " was not allocated in work RAM, " +
                    "address was " + (label.value === undefined ? "undefined" :
                    "0x" + ("0000" + label.value.toString(16).substr(-4)))
                ));
            case "SRAM":
                return callback(assert(
                    label.value >= 0x6000 &&
                    label.value <= 0x7FFF,
                    "Label " + name + " was not allocated in save RAM, " +
                    "address was " + (label.value === undefined ? "undefined" :
                    "0x" + ("0000" + label.value.toString(16).substr(-4)))
                ));            
        }
    });

    this.Then(/^the length of label "([^"]*)" should be (\d+)$/,
        function (name, length, callback) {
        var label = this.asm.getLabel(name);

        if(!label) {
            return callback(new Error("Label " + name + " is not defined"));
        }

        callback(assert.equal(label.length, length,
            "Expected label " + name + " to be " + length +
            " byte long but it was " + label.length + " instead"));
    });
};
