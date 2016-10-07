function RomBuffer(size) {
    this.buffer = new Buffer(size);
    this.buffer.fill(0);
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

RomBuffer.prototype.seek = function(ofs) {
    this.ofs = ofs;
}

module.exports = RomBuffer;
