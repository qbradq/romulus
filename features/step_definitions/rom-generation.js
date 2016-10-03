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

    this.Then(/^(PRG ROM|CHR ROM|output file) byte 0x([a-fA-F0-9]+) should be 0x([a-fA-F0-9]+)$/,
        function (which, address, value, callback) {
        address = parseInt(address, 16);
        value = parseInt(value, 16);
        var of;
        var name = "";

        switch(which) {
            case "PRG ROM":
                of = this.asm.prgrom.buffer;
                name = "PRG ROM";
                break;
            case "CHR ROM":
                of = this.asm.chrrom.buffer;
                name = "CHR ROM";
                break;
            case "output file":
                of = this.asm.getOutputBuffer();
                name = "output file";
                break;
            default:
                callback(null, 'pending');
        }
        callback(assert.equal(of.readUInt8(address), value,
            "Expected the " + name + " byte 0x" +
            ("0000" + address.toString(16)).substr(-4) +
            " to be 0x" + ("00" + value.toString(16)).substr(-2) +
            " but found 0x" +
            ("00" + of.readUInt8(address).toString(16)).substr(-2) +
            " instead"));
    });
};
