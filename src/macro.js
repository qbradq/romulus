function Macro(name, tokens) {
    this.name = name;
    this.tokens = tokens;
};

Macro.prototype.expand = function() {
    return this.tokens;
};

module.exports = Macro;
