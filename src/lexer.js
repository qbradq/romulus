var util = require("util"),
    Token = require("./token");

var keywords = {
    "origin": true
};

var operators = {
    "(": "left-parenthesis",
    ")": "right-parenthesis",
    "[": "left-bracket",
    "]": "right-bracket",
    "{": "left-brace",
    "}": "right-brace",
    ",": "comma",
    "+": "plus",
    "-": "minus",
    "*": "asterisk",
    "/": "forward-slash",
    "&": "ampersand",
    "<": "left-chevron",
    ">": "right-chevron",
    ".": "period"
};

var whitespaceChars = {
    " ": true,
    "\t": true,
    "\n": true,
    "\r": true
};

var identifierChars = {
    "_": true,
    "a": true,
    "b": true,
    "c": true,
    "d": true,
    "e": true,
    "f": true,
    "g": true,
    "h": true,
    "i": true,
    "j": true,
    "k": true,
    "l": true,
    "m": true,
    "n": true,
    "o": true,
    "p": true,
    "q": true,
    "r": true,
    "s": true,
    "t": true,
    "u": true,
    "v": true,
    "w": true,
    "x": true,
    "y": true,
    "z": true,
    "A": true,
    "B": true,
    "C": true,
    "D": true,
    "E": true,
    "F": true,
    "G": true,
    "H": true,
    "I": true,
    "J": true,
    "K": true,
    "L": true,
    "M": true,
    "N": true,
    "O": true,
    "P": true,
    "Q": true,
    "R": true,
    "S": true,
    "T": true,
    "U": true,
    "V": true,
    "W": true,
    "X": true,
    "Y": true,
    "Z": true
};

var hexadecimalChars = {
    "0": true,
    "1": true,
    "2": true,
    "3": true,
    "4": true,
    "5": true,
    "6": true,
    "7": true,
    "8": true,
    "9": true,
    "a": true,
    "b": true,
    "c": true,
    "d": true,
    "e": true,
    "f": true,
    "A": true,
    "B": true,
    "C": true,
    "D": true,
    "E": true,
    "F": true
};

var decimalChars = {
    "0": true,
    "1": true,
    "2": true,
    "3": true,
    "4": true,
    "5": true,
    "6": true,
    "7": true,
    "8": true,
    "9": true
};

var octalChars = {
    "0": true,
    "1": true,
    "2": true,
    "3": true,
    "4": true,
    "5": true,
    "6": true,
    "7": true
};

var binaryChars = {
    "0": true,
    "1": true
};

function Lexer() {
    this.tokens = [];
    this.file = "none";
    this.body = "";
    this.line = 1;
    this.char = 1;
    this.idx = 0;
    this.mode = "NONE";
}

Lexer.prototype.error = function() {
    var args = Array.prototype.slice.call(arguments);
    var msg = "";
    switch(args.length) {
        case 0:
            msg = "Unknown";
            break;
        case 1:
            msg = args[0];
            break;
        default:
            msg = util.format(args[0], args.slice(1));
            break;
    }

    throw {
        type: "Syntax",
        msg: msg,
        file: this.fileName,
        line: this.lineNumber,
        char: this.char,
        message: "Syntax Error:" + this.file + ":" + this.line +
            "(" + this.char + ") " + msg + "\n" + (new Error()).stack
    };
};

Lexer.prototype.lex = function(file, body) {
    // We pad the body with a newline just to make the lexer easier to write
    this.startLex(file, body + "\n");

    while(this.body.length > this.idx) {
        var token = this.token();
        if(token) {
            this.tokens.push(token);
        }
    }
};

Lexer.prototype.startLex = function(file, body) {
    this.file = file;
    this.body = body;
    this.line = 1;
    this.char = 1;
    this.idx = 0;
    this.mode = "NONE";
    this.blockCommentDepth = 0;
    this.reprocessLastChar = false;
};

Lexer.prototype.getc = function() {
    return this.body.charAt(this.idx++);
};

Lexer.prototype.prev = function() {
    return this.body.charAt(this.idx-2);
};

Lexer.prototype.eof = function() {
    if(this.idx >= this.body.length) {
        if(this.mode !== "NONE") {
            throw this.error("Unexpected end of file");
        }
        return true;
    }
    return false;
};

Lexer.prototype.token = function() {
    var startIdx = -1;
    var length = 0;
    var str = [];

    this.mode = "NONE";
    while(!this.eof()) {
        var c;
        if(this.reprocessLastChar) {
            c = this.body[this.idx-1];
            this.reprocessLastChar = false;
        } else {
            var c = this.getc();
            if(c === "\n") {
                ++this.line;
                this.char = 1;
            } else {
                ++this.char;
            }
        }

        switch(this.mode) {
            case "NONE":
                switch(c) {
                    case " ":
                    case "\n":
                    case "\r":
                    case "\t":
                        // Ignore whitespaceChars
                        break;
                    case "/":
                        this.mode = "POSSIBLE_COMMENT";
                        break;
                    case "0":
                        this.mode = "LEADING_ZERO";
                        break;
                    case "$":
                        this.mode = "HEXADECIMAL";
                        startIdx = this.idx;
                        length = 0;
                        break;
                    case "%":
                        this.mode = "BINARY";
                        startIdx = this.idx;
                        length = 0;
                        break;
                    case "\"":
                        this.mode = "STRING";
                        str = [];
                        break;
                    default:
                        if(decimalChars.hasOwnProperty(c)) {
                            this.mode = "DECIMAL";
                            startIdx = this.idx - 1;
                            length = 1;
                        } else if(identifierChars.hasOwnProperty(c)) {
                            this.mode = "IDENTIFIER";
                            startIdx = this.idx - 1;
                            length = 1;
                        } else if(operators.hasOwnProperty(c)) {
                            return new Token("operator", operators[c]);
                        } else {
                            throw this.error("Unexpected character %s", c);
                        }
                        break;
                }
                break;
            case "POSSIBLE_COMMENT":
                switch(c) {
                    case "/":
                        this.mode = "LINE_COMMENT";
                        break;
                    case "*":
                        this.mode = "BLOCK_COMMENT";
                        this.blockCommentDepth = 1;
                        break;
                    default:
                        this.reprocessLastChar = true;
                        return new Token("operator", operators["/"]);
                }
                break;
            case "LINE_COMMENT":
                switch(c) {
                    case "\n":
                        return null;
                    default:
                        break;
                }
                break;
            case "BLOCK_COMMENT":
                switch(c) {
                    case "/":
                        if(this.prev() === "*") {
                            --this.blockCommentDepth;
                            if(this.blockCommentDepth === 0) {
                                return null;
                            }
                        }
                        break;
                    case "*":
                        if(this.prev() === "/") {
                            ++this.blockCommentDepth;
                        }
                        break;
                    default:
                        // Ignore
                        break;
                }
                break;
            case "IDENTIFIER":
                if(identifierChars.hasOwnProperty(c) ||
                    decimalChars.hasOwnProperty(c)) {
                    ++length;
                } else {
                    var type = "identifier";
                    var name = this.body.substr(startIdx, length);
                    if(keywords.hasOwnProperty(name)) {
                        type = "keyword";
                    }
                    return new Token(type, name);
                }
                break;
            case "LEADING_ZERO":
                switch(c) {
                    case "x":
                    case "X":
                        this.mode = "HEXADECIMAL";
                        startIdx = this.idx;
                        length = 0;
                        break;
                    case "b":
                    case "B":
                        this.mode = "BINARY";
                        startIdx = this.idx;
                        length = 0;
                        break;
                    default:
                        if(octalChars.hasOwnProperty(c)) {
                            this.mode = "OCTAL";
                            startIdx = this.idx - 1;
                            length = 1;
                        } else {
                            this.reprocessLastChar = true;
                            return new Token("number", 0);
                        }
                        break;
                }
                break;
            case "HEXADECIMAL":
                if(hexadecimalChars.hasOwnProperty(c)) {
                    ++length;
                } else {
                    if(length <= 0) {
                        throw this.error("Expected hexadecimal digits");
                    }
                    this.reprocessLastChar = true;
                    return new Token("number",
                        parseInt(this.body.substr(startIdx, length), 16));
                }
                break;
            case "DECIMAL":
                if(decimalChars.hasOwnProperty(c)) {
                    ++length;
                } else {
                    this.reprocessLastChar = true;
                    return new Token("number",
                        parseInt(this.body.substr(startIdx, length), 10));
                }
                break;
            case "OCTAL":
                if(octalChars.hasOwnProperty(c)) {
                    ++length;
                } else {
                    this.reprocessLastChar = true;
                    return new Token("number",
                        parseInt(this.body.substr(startIdx, length), 8));
                }
                break;
            case "BINARY":
                if(binaryChars.hasOwnProperty(c)) {
                    ++length;
                } else {
                    this.reprocessLastChar = true;
                    if(length <= 0) {
                        throw this.error("Expected binary digits");
                    }
                    return new Token("number",
                        parseInt(this.body.substr(startIdx, length), 2));
                }
                break;
            case "STRING":
                switch(c) {
                    case "\\":
                        this.mode = "ESCAPE";
                        break;
                    case "\"":
                        return new Token("string", str.join(""));
                    default:
                        str.push(c);
                        break;
                }
                break;
            case "ESCAPE":
                switch(c) {
                    case "n":
                        this.mode = "STRING";
                        str.push("\n");
                        break;
                    case "t":
                        this.mode = "STRING";
                        str.push("\t");
                        break;
                    case "\\":
                        this.mode = "STRING";
                        str.push("\\");
                        break;
                    case "\"":
                        this.mode = "STRING";
                        str.push("\"");
                        break;
                    case "x":
                    case "X":
                        this.mode = "HEXADECIMAL_ESCAPE";
                        startIdx = this.idx;
                        length = 0;
                        break;
                    default:
                        if(octalChars.hasOwnProperty(c)) {
                            this.mode = "OCTAL_ESCAPE";
                            startIdx = this.idx - 1;
                            length = 1;
                        } else {
                            throw this.error("Unrecognized escape sequence \\%s", c);
                        }
                        break;
                }
                break;
            case "OCTAL_ESCAPE":
                if(octalChars.hasOwnProperty(c)) {
                    ++length;
                } else {
                    if(length != 3) {
                        throw this.error("Octal escapes must be three characters long");
                    }
                    var val = parseInt(this.body.substr(startIdx, length), 8);
                    if(val > 255) {
                        throw this.error("Octal escapes must not exceed 0377");
                    }
                    str.push(String.fromCharCode(val));
                    this.mode = "STRING";
                    this.reprocessLastChar = true;
                }
                break;
            case "HEXADECIMAL_ESCAPE":
                if(hexadecimalChars.hasOwnProperty(c)) {
                    ++length;
                } else {
                    if(length != 2) {
                        throw this.error("Hexadecimal escapes must be two characters long");
                    }
                    var val = parseInt(this.body.substr(startIdx, length), 16);
                    if(val > 255) {
                        throw this.error("Octal escapes must not exceed 0xFF");
                    }
                    str.push(String.fromCharCode(val));
                    this.mode = "STRING";
                    this.reprocessLastChar = true;
                }
                break;            
            default:
                throw this.error("Unhandled lexical mode %s", this.mode);
        }
    }
};

module.exports = Lexer;
