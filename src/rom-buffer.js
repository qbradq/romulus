function RomBuffer(size) {
    this.buffer = Buffer.alloc(size);
    this.ofs = 0;
    this.doWrites = true;
}

RomBuffer.prototype.emmit = function(emmit) {
    this.doWrites = emmit;
};

RomBuffer.prototype.write = function(value) {
    if(this.doWrites) {
        this.buffer.writeUInt8(value & 0xff, this.ofs);
    }
    ++this.ofs;
};

RomBuffer.prototype.reset = function() {
    this.ofs = 0;
};

module.exports = RomBuffer;
