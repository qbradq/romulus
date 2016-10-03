var assert = require("assert");

module.exports = function() {
    this.Then(/^the (PRG ROM|CHR ROM|output file) size should be (\d+)$/, function (which, size, callback) {
        size = parseInt(size, 10);

        switch(which) {
            case "PRG ROM":
                callback(assert.equal(this.asm.prgrom.buffer.length, size,
                    "Expected the PRG ROM area to be " + size +
                    " bytes long but it is " + this.asm.prgrom.buffer.length +
                    " bytes long instead"));
                break;
            case "CHR ROM":
                callback(assert.equal(this.asm.chrrom.buffer.length, size,
                    "Expected the CHR ROM area to be " + size +
                    " bytes long but it is " + this.asm.chrrom.buffer.length +
                    " bytes long instead"));
                break;
            case "output file":
                var of = this.asm.getOutputBuffer();
                callback(assert.equal(of.length, size,
                    "Expected the output file to be " + size +
                    " bytes long but it is " + of.length +
                    " bytes long instead"));
                break;
        }
        callback(null, 'pending');
    });
};
