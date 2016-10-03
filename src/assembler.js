var util = require("util"),
    fs = require("fs"),
    path = require("path"),
    Lexer = require("./lexer"),
    Label = require("./label"),
    RomBuffer = require("./rom-buffer");

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
    this.emmit = false;
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
}

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

Assembler.prototype.resolveLabelScope = function(name) {
    return name;
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

    // Generate code
};

Assembler.prototype.nextPrecompilePass = function() {
    this.tokens = this.tokensNextPass;
    this.tokensNextPass = [];
    this.nextPass();
};

Assembler.prototype.nextPass = function() {
    this.idx = 0;
};

Assembler.prototype.includeCompilationPass = function() {
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
    this.emmit = false;
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
            case "memory":
                if(this.wramofs + label.length > 0x0800) {
                    if(this.getCapability("sram")) {
                        if(this.sramofs + label.length > 0x8000) {
                            this.error("Unable to allocate static space for variable %s", label.name);
                        }
                        label.value = this.sramofs;
                        this.sramofs += label.length;
                    } else {
                        this.error("Unable to allocate memory space for variable %s", label.name);
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

    // Link all synonyms
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

Assembler.prototype.immediateValue = function() {
    var token = this.consume("number");
    if(token) {
        return token.value;
    }
    return undefined;
};

Assembler.prototype.expectImmediateValue = function() {
    var value = this.immediateValue();
    if(value === undefined) {
        this.error("Expected an immediate numeric value");
    }
    return value;
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

Assembler.prototype.statement = function() {
    return this.variable();
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
        mode = "memory";
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

module.exports = Assembler;
