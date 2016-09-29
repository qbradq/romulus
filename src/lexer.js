var util = require("util"),
    Token = require("./token");

var whitespaceChars = {
    " ": true,
    "\t": true,
    "\n": true,
    "\r": true
}

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
        message: msg,
        file: this.fileName,
        line: this.lineNumber,
        char: this.char
    };
};

Lexer.prototype.lex = function(file, body) {
    this.startLex(file, body);

    while(!this.eof()) {
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
};

Lexer.prototype.getc = function() {
    return this.body.charAt(this.idx++);
};

Lexer.prototype.ungetc = function() {
    --this.idx;
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
    this.mode = "NONE";
    this.whitespace();
    while(!this.eof()) {
        var c = this.getc();
        if(c === "\n") {
            ++this.line;
            this.char = 1;
        } else {
            ++this.char;
        }

        switch(this.mode) {
            case "NONE":
                switch(c) {
                    case "/":
                        this.mode = "POSSIBLE_COMMENT";
                        break;
                    default:
                        throw this.error("Unexpected character %s", c);                    
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
                        throw this.error("Unexpected character %s", c);                    
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
            default:
                throw this.error("Unhandled lexical mode %s", this.mode);
        }
    }
};

Lexer.prototype.whitespace = function() {
    while(!this.eof()) {
        var c = this.getc();
        if(!whitespaceChars.hasOwnProperty(c)) {
            return this.ungetc();
        }
    }
}

module.exports = Lexer;
