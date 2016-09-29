var EventEmitter = require('events').EventEmitter,
    util = require("util"),
    Number = require("./number"),
    Label = require("./label");

function Parser() {
    this.fileName;
    this.lineNumber;
    this.body;
}
util.inherits(Parser, EventEmitter);

Parser.prototype.error = function() {
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
        type: "Parse Error",
        message: msg,
        file: this.fileName,
        line: this.lineNumber
    };
};

Parser.prototype.stmnt = function(type, obj) {
    if(obj === undefined) {
        obj = {};
    }
    obj.type = type;
    obj.file = this.fileName;
    obj.line = this.lineNumber;
    return obj;
};

Parser.prototype.parse = function(fileName, body) {
    this.fileName = fileName;
    this.lineNumber = 1;
    this.body = body;

    var ret = [];

    while(this.body.length > 0) {
        var statement = this.statement();
        
        if(!statement) {
            this.error("Unexpected character " + this.body.charAt(0));
        } else {
            ret.push(statement);
        }
    }

    return ret;
};

Parser.prototype.consume = function(str) {
    var startLength = this.body.length;
    this.body = this.body.replace(str, "");
    if(this.body.length !== startLength - str.length) {
        throw new Error("Parser.consume() failed to consume string \"" + str + "\"");
    }

    var idx = str.indexOf("\n", 0);
    while(idx >= 0) {
        ++this.lineNumber;
        idx = str.indexOf("\n", idx+1);
    }
};

Parser.prototype.statement = function() {
    return this.directive() ||
        this.positionalLabel() ||
        this.lineComment() ||
        this.blockComment();
};

Parser.prototype.directive = function() {
    var match = this.body.match(/^\s*([a-z]+)\s*/);
    if(match) {
        if(typeof this["directive_" + match[1]] === "function") {
            this.consume(match[0]);
            return this["directive_" + match[1]]();
        }
    }
    return null;
};

Parser.prototype.numberOrLabel = function() {
    return this.label() ||
        this.parseNumber();
};

Parser.prototype.positionalLabel = function() {
    var match = this.body.match(/^\s*([a-zA-Z_][a-zA-Z0-9_]*):\s*/);    
    if(match) {
        this.consume(match[0]);
        return this.stmnt("positionalLabel", {
            label: new Label(match[1])
        });
    }
    return null;
};

Parser.prototype.label = function() {
    var match = this.body.match(/^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*/);
    if(match) {
        this.consume(match[0]);
        return new Label(match[1]);
    }
    return null;
};

Parser.prototype.parseNumber = function() {
    var match = this.body.match(/^\s*0x([0-9a-fA-F]+)\s*/);
    if(match) {
        this.consume(match[0]);
        return new Number(parseInt(match[1], 16));
    }
    
    match = this.body.match(/^\s*\$([0-9a-fA-F]+)\s*/);
    if(match) {
        this.consume(match[0]);
        return new Number(parseInt(match[1], 16));
    }
    
    match = this.body.match(/^\s*([1-9]\d*)\s*/);
    if(match) {
        this.consume(match[0]);
        return new Number(parseInt(match[1], 10));
    }
    
    match = this.body.match(/^\s*0(\d+)\s*/);
    if(match) {
        this.consume(match[0]);
        return new Number(parseInt(match[1], 8));
    }
    
    match = this.body.match(/^\s*0b([01]+)\s*/);
    if(match) {
        this.consume(match[0]);
        return new Number(parseInt(match[1], 2));
    }
    
    match = this.body.match(/^\s*%([01]+)\s*/);
    if(match) {
        this.consume(match[0]);
        return new Number(parseInt(match[1], 2));
    }

    return false;
};

Parser.prototype.lineComment = function() {
    var match = this.body.match(/^\s*\/\/[^\n]*\n\s*/);
    if(match) {
        this.consume(match[0]);
        return this.stmnt("comment");
    }
    match = this.body.match(/^\s*\/\/[^\n]*$/);
    if(match) {
        this.consume(match[0]);
        return this.stmnt("comment");
    }
    return false;
};

Parser.prototype.blockComment = function() {
    var match = this.body.match(/^\s*\/\*/);
    if(match) {
        this.consume(match[0]);
        if(!this.blockCommentBody()) {
            return null;
        }
        return this.stmnt("comment");
    }
    return false;
};

Parser.prototype.blockCommentBody = function() {
    var match = this.body.match(/^[\s\S]*?(\/\*|\*\/)\s*/);
    if(match) {
        this.consume(match[0]);
        if(match[1] === "*/") {
            return true;
        } else {
            this.blockCommentBody();
            match = this.body.match(/^[\s\S]*?\*\/\s*/);
            if(!match) {
                return false;
            }
            this.consume(match[0]);
            return true;
        }
    }
    return false;
};

Parser.prototype.directive_origin = function() {
    var arg = this.numberOrLabel();
    if(!arg) {
        this.error("Expected a numeric or label argument");
    }
    return this.stmnt("origin", {
        destination: arg
    });
};

Parser.prototype.directive_define = function() {
    var label = this.label();
    if(!label) {
        this.error("Expected an identifier to follow keyword define");
    }
    var value = this.parseNumber();
    if(!value) {
        this.error("Expected a numeric litteral value to follow the identifier");
    }
    label.set(value.getValue());
    return this.stmnt("litteralLabel", {
        label: label
    });
};

module.exports = Parser;
