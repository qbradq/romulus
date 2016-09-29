function Label(name, value) {
    this.name = name;
    this.value = value;
    this.offset = 0;
}

Label.prototype.add = function(offset) {
    this.offset += offset;
};

Label.prototype.set = function(value) {
    this.value = value;
    this.offset = 0;
};

Label.prototype.getValue = function() {
    if(this.value === undefined) {
        return undefined;
    }
    return this.value + this.offset;
};

module.exports = Label;
