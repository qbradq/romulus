function Token(type, value, file, line, char) {
    this.type = type;
    this.value = value;
    this.file = file;
    this.line = line;
    this.char = char;
}

module.exports = Token;
