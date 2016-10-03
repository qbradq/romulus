var Assembler = require("../../src/assembler");

module.exports = function() {
    this.World = function() {
        this.asm = new Assembler();
    };
};
