var Assembler = require("../../src/assembler");

function World() {
    this.asm = new Assembler();
    this.asm.throwOnError = true;
}

module.exports = function() {
    this.World = World;
};
