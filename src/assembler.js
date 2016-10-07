var util = require("util"),
    fs = require("fs"),
    path = require("path"),
    Lexer = require("./lexer"),
    Label = require("./label"),
    RomBuffer = require("./rom-buffer"),
    opcodes = require("./opcodes");

var addressingModeNames = [
    "Implied",
    "Immediate",
    "Zeropage",
    "Zeropage,X",
    "Zeropage,Y",
    "Absolute",
    "Absolute,X",
    "Absolute,Y",
    "Indirect",
    "Indexed Indirect",
    "Indirect Indexed",
    "Relative"
]

var includeCompilationKeywords = {
    "include": true
};

var conditionalCompilationKeywords = {
    "if": true,
    "flag": true
};

var capabilitiesKeywords = {
    "capability": true
};

function Assembler() {
    this.pass = "";
    this.ignoreUnknownLabels = false;
    this.lexer = new Lexer();
    this.tokens = [];
    this.tokensNextPass = [];
    this.flags = {};
    this.idx = 0;
    this.file = "";
    this.line = 0;
    this.char = 0;
    this.capabilities = {
        "mapper": 0,
        "busconflict": false,
        "prgrom": 1,
        "chrrom": 1,
        "mirroring": "vertical",
        "sram": false,
        "pal": false
    };
    this.labels = {};
    this.zpofs = 0x0000;
    this.wramofs = 0x0300;
    this.sramofs = 0x6000;
    this.header = null;
    this.prgrom = null;
    this.chrrom = null;
    this.segment = "PRG";
    this.prgSegmentLength = 0;
    this.prgSegmentMax = 0x8000;
    this.origin = 0x8000;
    this.scopeStack = [];
}

Assembler.prototype.setEmmitFlag = function(flag) {
    this.prgrom.emmit(flag);
    this.chrrom.emmit(flag);
};

Assembler.prototype.write = function(value) {
    switch(this.segment) {
        case "PRG":
            if(this.prgSegmentLength >= this.prgSegmentMax) {
                this.error("Code segment overflow");
            }
            if(this.origin >= 0x10000) {
                this.error("Origin overflow");
            }
            this.prgrom.write(value);
            ++this.prgSegmentLength;
            ++this.origin;
            break;
        case "CHR":
            this.chrrom.write(value);
            break;
        default:
            this.error("Unhandled segment %s", this.segment);
            break;
    }
};

Assembler.prototype.getOutputBuffer = function() {
    var size = this.header.buffer.length +
        this.prgrom.buffer.length +
        this.chrrom.buffer.length;
    var ret = new Buffer(size);
    this.header.buffer.copy(ret, 0);
    this.prgrom.buffer.copy(ret,
        this.header.buffer.length);
    this.chrrom.buffer.copy(ret,
        this.header.buffer.length +
        this.prgrom.buffer.length);
    return ret;
};

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

    throw {
        type: "Compilation",
        msg: msg,
        file: this.file,
        line: this.line,
        char: this.char,
        message: "Compilation Error:" + this.file + ":" + this.line +
            "(" + this.char + ") " + msg,
        stack: (new Error()).stack
    };
};

Assembler.prototype.joinScope = function() {
    if(arguments.length < 1) {
        this.error("Assembler.joinScope() called with no arguments");
    }

    var ret = arguments[0];
    for(var i = 1; i < arguments.length; ++i) {
        ret += "." + arguments[1];
    }

    return ret;
}

Assembler.prototype.searchLabel = function(name) {
    var scopes = this.scopeStack.slice(0);
    while(scopes.length > 0) {
        var fqn = scopes.concat(name).join(".");
        if(this.labels.hasOwnProperty(fqn)) {
            return this.labels[fqn];
        }
        scopes.pop();
    }
    return this.labels[name];
};

Assembler.prototype.resolveLabelScope = function(name) {
    return this.scopeStack.concat(name).join(".");
};

Assembler.prototype.registerLabel = function(label) {
    var name = this.resolveLabelScope(label.name);
    if(this.labels.hasOwnProperty(name)) {
        this.error("Duplicate label %s", label.name);
    }
    this.labels[name] = label;
};

Assembler.prototype.getLabel = function(name) {
    var labelName = this.resolveLabelScope(name);
    return this.labels[labelName];
};

Assembler.prototype.resolveLabel = function(name) {
    var label = this.searchLabel(name);
    if(!label) {
        if(this.ignoreUnknownLabels) {
            return 0x80;
        } else {
            this.error("Unresolved label %s", name);
        }
    }
    return label.value;
};

Assembler.prototype.setCapability = function(name, value) {
    switch(name) {
        case "mapper":
            if(typeof value !== "number" ||
                (value < 0 || value >= 256)) {
                this.error("Invalid mapper value %d", value);
            }
            this.capabilities.mapper = value;
            break;
        case "busconflict":
            this.capabilities.busconflict = value ? true : false;
            break;
        case "prgrom":
            if(typeof value !== "number" ||
                (value < 1 || value >= 256)) {
                this.error("Invalid number of PRG-ROM banks %d", value);
            }
            this.capabilities.prgrom = value;
            break;
        case "chrrom":
            if(typeof value !== "number" ||
                (value < 0 || value >= 256)) {
                this.error("Invalid number of CHR-ROM banks %d", value);
            }
            this.capabilities.chrrom = value;
            break;
        case "mirroring":
            if(value !== "horizontal" &&
                value !== "vertical" &&
                value !== "fourscreen") {
                this.error("Invalid mirroring mode %s", value);
            }
            this.capabilities.mirroring = value;
            break;
        case "sram":
            this.capabilities.sram = value ? true : false;
            break;
        case "pal":
            this.capabilities.pal = value ? true : false;
            break;
        default:
            this.error("Unrecognized capability name %s", name);
            break;
    }
};

Assembler.prototype.getCapability = function(name) {
    return this.capabilities[name];
};

Assembler.prototype.setFlag = function(name) {
    this.flags[name] = true;
};

Assembler.prototype.unsetFlag = function(name) {
    delete this.flags[name];
};

Assembler.prototype.getFlag = function(name) {
    return this.flags[name] ? true : false; 
};

Assembler.prototype.rewindStream = function(offset) {
    if(offset === undefined) {
        this.idx = 0;
    } else {
        this.idx -= offset;
    }
};

Assembler.prototype.endOfStream = function() {
    return this.tokens.length <= this.idx;
};

Assembler.prototype.rollBack = function() {
    if(this.idx > 0) {
        --this.idx;
    }
};

Assembler.prototype.consume = function(type, value) {
    if(this.endOfStream()) {
        return null;
    }
    var token = this.tokens[this.idx];
    if(type !== undefined &&
        token.type !== type) {
        return null;
    }
    if(value !== undefined &&
        token.value !== value) {
        return null;
    }
    ++this.idx;
    this.file = token.file;
    this.line = token.line;
    this.char = token.char;
    return token;
};

Assembler.prototype.expect = function(type, value) {
    var token = this.consume(type, value);
    if(!token) {
        if(value === undefined) {
            if(type === undefined) {
                this.error("Unexpected end of stream");
            } else {
                this.error("Expected %s", type);
            }
        } else {
            this.error("Expected %s %s", type, value);
        }
    }
    return token;
};

Assembler.prototype.compileString = function(str) {
    this.tokensNextPass = this.lexer.lex("string", str);
    this.compile();
};

Assembler.prototype.compileFile = function(filePath) {
    if(!path.isAbsolute(filePath)) {
        throw new Error("Assembler.compileFile() file path must be absolute");
    }
    filePath = path.relative(process.cwd(), filePath);
    console.log(filePath);
    this.tokensNextPass = this.lexer.lex(filePath, fs.readFileSync(filePath));
    this.compile();
};

Assembler.prototype.compile = function() {
    // Process include statements
    while(true) {
        this.nextPrecompilePass();
        if(this.includeCompilationPass() == 0) {
            break;
        }
    }

    // Process conditional compilation statements
    while(true) {
        this.nextPrecompilePass();
        this.conditionalCompilationPass();
        if(this.tokens.length === this.tokensNextPass.length) {
            break;
        }
    }

    // Expand macros

    // Process capabilities
    this.nextPrecompilePass();
    this.capabilitiesPass();
    this.processCapabilities();

    // Scan labels
    this.nextPrecompilePass();
    this.scanLabelPass();

    // Resolve labels
    this.nextPass();
    this.resolveRAMLabels();
    this.resolveLabelsPass();
    this.linkSynonyms();

    // Generate code
    this.nextPass();
    this.generateCodePass();
};

Assembler.prototype.nextPrecompilePass = function() {
    this.tokens = this.tokensNextPass;
    this.tokensNextPass = [];
    this.nextPass();
};

Assembler.prototype.nextPass = function() {
    if(this.scopeStack.length > 0) {
        this.error("Unterminated scope %s", this.scopeStack.pop());
    }
    this.scopeStack = [];
    this.idx = 0;
    this.segment = "PRG";
    this.prgSegmentLength = 0;
    this.prgSegmentMax = 0x8000;
    this.origin = 0x8000;
    if(this.prgrom) {
        this.prgrom.reset();
    }
    if(this.chrrom) {
        this.chrrom.reset();
    }
};

Assembler.prototype.includeCompilationPass = function() {
    this.pass = "include";
    var ret = 0;

    while(true) {
        var token = this.consume();
        if(!token) {
            break;
        }
        if(token.type === "keyword" &&
            includeCompilationKeywords.hasOwnProperty(token.value)) {
            this["keyword_" + token.value]();
            ++ret;
        } else {
            this.tokensNextPass.push(token);
        }
    }
    return ret;
};

Assembler.prototype.conditionalCompilationPass = function() {
    this.pass = "conditional";

    while(true) {
        var token = this.consume();
        if(!token) {
            break;
        }
        if(token.type === "keyword" &&
            conditionalCompilationKeywords.hasOwnProperty(token.value)) {
            this["keyword_" + token.value]();
        } else {
            this.tokensNextPass.push(token);
        }
    }
};

Assembler.prototype.capabilitiesPass = function() {
    this.pass = "capabilities";

    while(true) {
        var token = this.consume();
        if(!token) {
            break;
        }
        if(token.type === "keyword" &&
            capabilitiesKeywords.hasOwnProperty(token.value)) {
            this["keyword_" + token.value]();
        } else {
            this.tokensNextPass.push(token);
        }
    }
};

Assembler.prototype.processCapabilities = function() {
    this.header = new RomBuffer(16);
    this.prgrom = new RomBuffer(this.getCapability("prgrom") * 16 * 1024);
    this.chrrom = new RomBuffer(this.getCapability("chrrom") * 8 * 1024);

    // Magic number
    this.header.write(0x4e);
    this.header.write(0x45);
    this.header.write(0x53);
    this.header.write(0x1a);

    // Number of PRG ROM banks
    this.header.write(this.getCapability("prgrom"));

    // Number of CHR ROM banks
    this.header.write(this.getCapability("chrrom"));

    // Flags 6 byte
    var f6 = (this.getCapability("mapper") & 0x0f) << 4;
    f6 |= this.getCapability("sram") ? 0x02 : 0x00;
    f6 |= this.getCapability("mirroring") === "fourscreen" ? 0x04 : 0x00;
    f6 |= this.getCapability("mirroring") === "horizontal" ? 0x01 : 0x00;
    this.header.write(f6);

    // Flags 7
    var f7 = this.getCapability("mapper") & 0xf0;
    this.header.write(f7);

    // SRAM size
    this.header.write(this.getCapability("sram") ? 1 : 0);

    // Flags 9
    var f9 = 0x00;
    f9 |= this.getCapability("pal") ? 0x01 : 0x00;
    this.header.write(f9);

    // Flags 10
    var f10 = 0x00;
    f10 |= this.getCapability("pal") ? 0x02 : 0x00;
    f10 |= this.getCapability("sram") ? 0x00 : 0x10;
    f10 |= this.getCapability("busconflict") ? 0x20 : 0x00;
    this.header.write(f10);
};

Assembler.prototype.scanLabelPass = function() {
    this.pass = "label";

    this.setEmmitFlag(false);
    this.ignoreUnknownLabels = true;

    while(!this.endOfStream()) {
        if(!this.statement()) {
            var token = this.consume();
            this.error("Unexpected %s", token.type);
        }
    }
};

Assembler.prototype.resolveRAMLabels = function() {
    // Allocate all hard labels
    for(var name in this.labels) {
        if(!this.labels.hasOwnProperty(name)) {
            continue;
        }
        var label = this.labels[name];
        if(label.synonym) {
            continue;
        }

        switch(label.mode) {
            case "fast":
                if(this.zpofs + label.length > 0x0100) {
                    this.error("Unable to allocate zeropage space for variable %s", label.name);
                }
                label.value = this.zpofs;
                this.zpofs += label.length;
                break;
            case "static":
                if(!this.getCapability("sram")) {
                    this.error("Attempted to allocate a static variable when sram is disabled");
                }
                if(this.sramofs + label.length > 0x8000) {
                    this.error("Unable to allocate static space for variable %s", label.name);
                }
                label.value = this.sramofs;
                this.sramofs += label.length;
                break;
            case "ram":
                if(this.wramofs + label.length > 0x0800) {
                    if(this.getCapability("sram")) {
                        if(this.sramofs + label.length > 0x8000) {
                            this.error("Unable to allocate static space for variable %s", label.name);
                        }
                        label.value = this.sramofs;
                        this.sramofs += label.length;
                    } else {
                        this.error("Unable to allocate ram space for variable %s", label.name);
                    }
                }
                label.value = this.wramofs;
                this.wramofs += label.length;
                break;
            default:
                // Non-RAM label
                break;
        }
    }
};

Assembler.prototype.resolveLabelsPass = function() {
    this.pass = "resolve";

    this.setEmmitFlag(false);
    this.ignoreUnknownLabels = false;

    while(!this.endOfStream()) {
        if(!this.statement()) {
            var token = this.consume();
            this.error("Unexpected %s", token.type);
        }
    }
};

Assembler.prototype.linkSynonyms = function() {
    for(var name in this.labels) {
        if(!this.labels.hasOwnProperty(name)) {
            continue;
        }
        var label = this.labels[name];
        if(!label.synonym) {
            continue;
        }
        label.value = label.synonym.value;
    }
};

Assembler.prototype.generateCodePass = function() {
    this.pass = "code";

    this.setEmmitFlag(true);
    this.ignoreUnknownLabels = false;

    while(!this.endOfStream()) {
        if(!this.statement()) {
            var token = this.consume();
            this.error("Unexpected %s", token.type);
        }
    }
};

Assembler.prototype.immediateValue = function() {
    var value = undefined;

    var token = this.consume("number");
    if(token) {
        value = token.value;
    } else if(this.consume("operator", "octothorpe")) {
        var shift = 0;
        if(this.consume("operator", "left-chevron")) {
            shift = 0;
        } else if(this.consume("operator", "right-chevron")) {
            shift = 8;
        }
        value = this.consumeLabel() >>> shift;
    }
    return value;
};

Assembler.prototype.expectImmediateValue = function() {
    var value = this.immediateValue();
    if(value === undefined) {
        this.error("Expected an immediate numeric value");
    }
    return value;
};

Assembler.prototype.consumeLabel = function() {
    var name = "";
    while(true) {
        var label = this.consume("identifier");
        if(label) {
            name += label.value;
        }
        if(this.consume("operator", "period")) {
            name += ".";
        } else {
            break;
        }
    }

    if(name !== "") {
        var l = this.searchLabel(name);
        if(l) {
            if(l.value === undefined) {
                if(l.mode === "fast") {
                    return 0x80;
                } else {
                    return 0x8000;
                }
            } else {
                return l.value;
            }
        } else {
            return undefined;
        }
    }

    return undefined;
};

Assembler.prototype.addressOrLabel = function() {
    if(this.consume("operator", "asterisk")) {
        return this.expectImmediateValue();
    }

    return this.consumeLabel();
};

Assembler.prototype.keyword_flag = function() {
    var mode = "set";

    if(this.consume("keyword", "on")) {
        // off keyword not allowed
    } else if(this.consume("keyword", "off")) {
        mode = "unset";
    }

    var name = this.expect("identifier");
    if(mode === "set") {
        this.setFlag(name.value);
    } else {
        this.unsetFlag(name.value);
    }
};

Assembler.prototype.keyword_if = function() {
    var not = false;
    var emmit = true;

    if(this.consume("keyword", "not")) {
        not = true;
    }
    var name = this.expect("identifier").value;

    if(not) {
        emmit = this.getFlag(name) === false;
    } else {
        emmit = this.getFlag(name) === true;
    }

    while(true) {
        var token = this.expect();

        if(token.type === "keyword") {
            // Support nested ifs
            switch(token.value) {
                case "if":
                    this.keyword_if();
                    break;
                case "else":
                    emmit = !emmit;
                    break;
                case "endif":
                    return;
                default:
                    if(emmit) {
                        this.tokensNextPass.push(token);
                    }
                    break;
            }
        } else if(emmit) {
            this.tokensNextPass.push(token);
        }
    }
};

Assembler.prototype.keyword_include = function() {
    var filePath = this.expect("string").value;
    if(!path.isAbsolute(filePath)) {
        filePath = path.normalize(
            path.join(path.dirname(this.file), filePath));
    }
    this.tokensNextPass = this.tokensNextPass.concat(
        this.lexer.lex(filePath, fs.readFileSync(filePath)));
};

Assembler.prototype.keyword_capability = function() {
    var name = this.expect("identifier").value;

    switch(name) {
        case "mapper":
        case "prgrom":
        case "chrrom":
            this.setCapability(name, this.expectImmediateValue());
            break;
        case "busconflict":
        case "sram":
        case "pal":
            var switchVal = this.expect("keyword");
            if(switchVal.value === "on") {
                this.setCapability(name, true);
            } else if(switchVal.value === "off") {
                this.setCapability(name, false);
            } else {
                this.error("Expected either on or off");
            }
            break;
        case "mirroring":
            this.setCapability(name, this.expect("identifier").value);
            break;
        default:
            this.error("Unrecognized capability %s", name);
            break;            
    }
};

Assembler.prototype.keyword_out = function() {
    if(!this.consume("keyword", "out")) {
        return false;
    }

    var storageToken = this.consume("keyword", "byte") ||
        this.consume("keyword", "word") ||
        this.consume("keyword", "triplet") ||
        this.consume("keyword", "dword");
    
    if(!storageToken) {
        this.error("Expected a storage specifier");
    }

    var length = 0;
    switch(storageToken.value) {
        case "byte":
            length = 1;
            break;
        case "word":
            length = 2;
            break;
        case "triplet":
            length = 3;
            break;
        case "dword":
            length = 4;
            break;
        default:
            this.error("Unhandled storage specifier %s", storageToken.value);
            break;
    }

    var value = this.expectImmediateValue();
    for(var i = 0; i < length; ++i) {
        this.write(value & 0xff);
        value = value >>> 8;
    }

    return true;
};

Assembler.prototype.keyword_ascii = function() {
    if(!this.consume("keyword", "ascii")) {
        return false;
    }

    var str = this.expect("string").value;
    var offset = 0;
    if(this.consume("operator", "comma")) {
        offset = this.expectImmediateValue();
    }

    for(var i = 0; i < str.length; ++i) {
        this.write(str.charCodeAt(i) + offset);
    }

    return true;
};

Assembler.prototype.keyword_table = function() {
    if(!this.consume("keyword", "table")) {
        return false;
    }

    var storageToken = this.consume("keyword", "byte") ||
        this.consume("keyword", "word") ||
        this.consume("keyword", "triplet") ||
        this.consume("keyword", "dword");
    
    if(!storageToken) {
        this.error("Expected a storage specifier");
    }

    var elementLength = 0;
    switch(storageToken.value) {
        case "byte":
            elementLength = 1;
            break;
        case "word":
            elementLength = 2;
            break;
        case "triplet":
            elementLength = 3;
            break;
        case "dword":
            elementLength = 4;
            break;
        default:
            this.error("Unhandled storage specifier %s", storageToken.value);
            break;
    }

    var name = this.expect("identifier").value;
    var elements = [];
    while(true) {
        elements.push(this.expectImmediateValue());
        if(!this.consume("operator", "comma")) {
            break;
        }
    }

    // Generate data
    var tableStartAddr = this.origin;
    for(var i = 0; i < elementLength; ++i) {
        for(var j = 0; j < elements.length; ++j) {
            this.write(elements[j] & 0xff);
            elements[j] = elements[j] >>> 8;
        }
    }

    // Generate labels
    if(this.pass !== "label") {
        return true;
    }

    var length = elements.length;
    var baseLabel = new Label(name, tableStartAddr, length, "rom");
    this.registerLabel(baseLabel);

    for(var i = 0; i < elementLength; ++i) {
        var char = String.fromCharCode(97 + i);
        var label = new Label(this.joinScope(name, char),
            tableStartAddr + i * length, length, "rom", undefined);
        if(i === 0) {
            baseLabel.synonym = label;
        }
        this.registerLabel(label);
    }

    return true;
};

Assembler.prototype.keyword_prgbank = function() {
    if(!this.consume("keyword", "prgbank")) {
        return false;
    }

    var bank = this.expectImmediateValue();
    if(bank > this.getCapability("prgrom")) {
        this.error("Requested bank exceeds number of PRG ROM banks");
    }

    this.segment = "PRG";
    this.prgrom.seek(0x4000 * bank);

    return true;
};

Assembler.prototype.keyword_prgofs = function() {
    if(!this.consume("keyword", "prgofs")) {
        return false;
    }
    
    var ofs = this.expectImmediateValue();
    if(ofs >= this.prgrom.buffer.length) {
        this.error("Requested offset exceeds the length of PRG ROM");
    }

    this.segment = "PRG";
    this.prgrom.seek(ofs);

    return true;
};

Assembler.prototype.keyword_chrbank = function() {
    if(!this.consume("keyword", "chrbank")) {
        return false;
    }

    var bank = this.expectImmediateValue();
    if(bank > this.getCapability("chrrom")) {
        this.error("Requested bank exceeds number of CHR ROM banks");
    }

    this.segment = "CHR";
    this.chrrom.seek(0x2000 * bank);

    return true;
};

Assembler.prototype.keyword_chrofs = function() {
    if(!this.consume("keyword", "chrofs")) {
        return false;
    }
    
    var ofs = this.expectImmediateValue();
    if(ofs >= this.chrrom.buffer.length) {
        this.error("Requested offset exceeds the length of CHR ROM");
    }

    this.segment = "CHR";
    this.chrrom.seek(ofs);

    return true;
};

Assembler.prototype.keyword_codepage = function() {
    if(!this.consume("keyword", "codepage")) {
        return false;
    }

    this.origin = this.expectImmediateValue();
    this.expect("operator", "comma");
    this.prgSegmentMax = this.expectImmediateValue();
    this.prgSegmentLength = 0;

    return true;
};

Assembler.prototype.keyword_scope = function() {
    if(!this.consume("keyword", "scope")) {
        return false;
    }

    var name = this.expect("identifier");
    this.expect("operator", "left-brace");
    this.defineLabel(name.value);
    this.scopeStack.push(name.value);

    return true;
};

Assembler.prototype.keyword_scope_end = function() {
    if(!this.consume("operator", "right-brace")) {
        return false;
    }

    if(this.scopeStack.length < 1) {
        this.error("Unexpected operator left-brace");
    }

    this.scopeStack.pop();

    return true;
};

Assembler.prototype.statement = function() {
    return this.label() || 
        this.variable() ||
        this.keyword_out() ||
        this.keyword_ascii() ||
        this.keyword_table() ||
        this.keyword_prgbank() ||
        this.keyword_prgofs() ||
        this.keyword_chrbank() ||
        this.keyword_chrofs() ||
        this.keyword_codepage() ||
        this.keyword_scope() ||
        this.keyword_scope_end() ||
        this.opcode();
};

Assembler.prototype.label = function() {
    var name = this.consume("identifier");
    if(name) {
        if(this.consume("operator", "colon")) {
            this.defineLabel(name.value);
            return true;
        } else {
            this.rollBack();
            return false;
        }
    } else {
        return false;
    }
};

Assembler.prototype.variable = function() {
    var mode = null;
    if(this.consume("keyword", "fast")) {
        mode = "fast";
    } else if(this.consume("keyword", "static")) {
        mode = "static";
    }

    var storageToken = this.consume("keyword", "byte") ||
        this.consume("keyword", "word") ||
        this.consume("keyword", "triplet") ||
        this.consume("keyword", "dword");
    
    if(!storageToken) {
        if(mode !== null) {
            this.error("Expected a storage keyword");
        }
        return false;
    }

    if(mode === null) {
        mode = "ram";
    }

    var numberOfLabels = 0;
    switch(storageToken.value) {
        case "byte":
            numberOfLabels = 1;
            break;
        case "word":
            numberOfLabels = 2;
            break;
        case "triplet":
            numberOfLabels = 3;
            break;
        case "dword":
            numberOfLabels = 4;
            break;
        default:
            this.error("Unhandled storage token %s", storageToken.value);
            break;
    }

    var length = 1;
    if(this.consume("operator", "left-bracket")) {
        length = this.expectImmediateValue();
        this.expect("operator", "right-bracket");
    }

    var name = this.expect("identifier").value;

    if(this.pass !== "label") {
        return true;
    }

    var baseLabel = new Label(name, undefined, length, mode);
    this.registerLabel(baseLabel);

    for(var i = 0; i < numberOfLabels; ++i) {
        var char = String.fromCharCode(97 + i);
        var label = new Label(this.joinScope(name, char), undefined, length,
            mode, undefined);
        if(i === 0) {
            baseLabel.synonym = label;
        }
        this.registerLabel(label);
    }

    return true;
};

Assembler.prototype.opcode = function() {
    var opcode = this.consume("opcode");
    if(!opcode) {
        return false;
    }
    opcode = opcode.value;
    var opcodeData = opcodes[opcode];
    if(!opcodeData) {
        this.error("Unsupported opcode %s", opcode);
    }

    var addressingMode = 0;
    var value;
    value = this.immediateValue();
    if(value !== undefined) {
        addressingMode = 1;
    }
    if(value === undefined) {
        value = this.addressOrLabel();
        if(value !== undefined) {
            if(this.consume("operator", "comma")) {
                if(this.consume("identifier", "x")) {
                    if(value < 0x0100) {
                        addressingMode = 3;
                    } else {
                        addressingMode = 6;
                    }
                } else if(this.consume("identifier", "y")) {
                    if(value < 0x0100) {
                        addressingMode = 4;
                    } else {
                        addressingMode = 7;
                    }
                } else {
                    this.error("Expected either X or Y index");
                }
            } else {
                if(value < 0x0100) {
                    addressingMode = 2;
                } else {
                    addressingMode = 5;
                }
            }
        }
    }
    if(value === undefined) {
        if(this.consume("operator", "left-parenthesis")) {
            value = this.addressOrLabel();
            if(value !== undefined) {
                if(this.consume("operator", "comma")) {
                    this.expect("identifier", "x");
                    this.expect("operator", "right-parenthesis");
                    if(value < 0x0100) {
                        addressingMode = 9;                        
                    } else {
                        this.error("Only zeropage addresses can be used for indexed indirect mode");
                    }
                } else {
                    this.expect("operator", "right-parenthesis");
                    if(this.consume("operator", "comma")) {
                        this.expect("identifier", "y");
                        if(value < 0x0100) {
                            addressingMode = 10;                        
                        } else {
                            this.error("Only zeropage addresses can be used for indirect indexed mode");
                        }
                    } else {
                        addressingMode = 8;
                    }
                }
            }
        }
    }

    var opcodeByte = opcodeData[addressingMode];
    if(opcodeByte === null) {
        if(addressingMode >= 2 &&
            addressingMode <= 4) {
            addressingMode += 3;
        }
    }
    opcodeByte = opcodeData[addressingMode];
    if(opcodeByte === null &&
        addressingMode === 5) {
        addressingMode = 11;
    }
    opcodeByte = opcodeData[addressingMode];
    if(opcodeByte === null) {
        this.error("Opcode %s does not support addressing mode %s",
            opcode, addressingModeNames[addressingMode]);
    }

    switch(addressingMode) {
        case 0:
            this.write(opcodeByte);
            break;
        case 1:
        case 2:
        case 3:
        case 4:
        case 9:
        case 10:
            this.write(opcodeByte);
            this.write(value);
            break;
        case 5:
        case 6:
        case 7:
        case 8:
            this.write(opcodeByte);
            this.write(value);
            this.write(value >>> 8);
            break;
        case 11:
            var endPc = (this.origin + 2) & 0xffff;
            var ofs = value - endPc;
            if(this.pass === "code") {
                if(ofs < -128 ||
                    ofs > 127) {
                    this.error("Branch address out of range");
                }
                if(ofs < 0) {
                    ofs = 256 + ofs;
                }
            } else {
                ofs = 0x80;
            } 
            this.write(opcodeByte);
            this.write(ofs);
            break;
        default:
            this.error("Unhandled addressing mode");
            break;
    }

    return true;
};

Assembler.prototype.defineLabel = function(name) {
    if(this.pass === "label") {
        this.registerLabel(new Label(
            name, undefined, 0, "ROM", undefined
        ));
    } else if(this.pass === "resolve") {
        var label = this.getLabel(name);
        label.value = this.origin;
    }
};

module.exports = Assembler;
