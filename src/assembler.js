var EventEmitter = require('events').EventEmitter,
    util = require("util"),
    Parser = require("./parser");

function Assembler() {
    this.parser = new Parser();
    this.statements = [];
    this.currentStatement = null;
    this.pc = 0;
    this.errors = [];
    this.labels = {};
    this.pass = 0;
    this.throwOnError = false;
}
util.inherits(Assembler, EventEmitter);

Assembler.prototype.error = function() {
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

    this.errors.push({
        type: "Assembly Error",
        message: msg,
        file: this.currentStatement.file,
        line: this.currentStatement.line
    });

    if(this.throwOnError) {
        throw this.errors.pop();
    }
};

Assembler.prototype.registerLabel = function(label) {
    if(this.labels.hasOwnProperty(label.name)) {
        this.error("Duplicate label %s", label.name);
    }
    this.labels[label.name] = label;
};

Assembler.prototype.findLabel = function(name) {
    var label = this.labels[name];
    if(label) {
        return label;
    }
    return null;
};

Assembler.prototype.parse = function(fileName, body) {
    this.statements = this.statements.concat(
        this.parser.parse(fileName, body)
    );
};

Assembler.prototype.assemble = function() {
    this.assemblePass(1);
    this.assemblePass(2);
    this.assemblePass(3);
};

Assembler.prototype.assemblePass = function(pass) {
    this.pass = pass;

    for(var i = 0; i < this.statements.length; ++i) {
        this.currentStatement = this.statements[i];
        this[this.currentStatement.type]();
    }
};

Assembler.prototype.comment = function() {
    // Do nothing
};

Assembler.prototype.origin = function() {
    if(this.pass === 3) {
        console.log(this.currentStatement.destination);
        this.pc = this.currentStatement.destination.getValue();
        if(this.pc === undefined) {
            this.error("Unresolved label %s", this.currentStatement.destination.name);
        }
    }
};

Assembler.prototype.positionalLabel = function() {
    if(this.pass === 1) {
        this.registerLabel(this.currentStatement.label);
    } else if(this.pass === 2) {
        this.currentStatement.label.set(this.pc);
    }
};

Assembler.prototype.litteralLabel = function() {
    if(this.pass === 1) {
        this.registerLabel(this.currentStatement.label);
    }
};

module.exports = Assembler;
