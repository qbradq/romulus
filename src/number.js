function Number(value) {
    this.value = value;
}

Number.prototype.add = function(offset) {
    this.value += offset;
};

Number.prototype.set = function(value) {
    this.value = value;
};

Number.prototype.getValue = function() {
    return this.value;
};

module.exports = Number;
