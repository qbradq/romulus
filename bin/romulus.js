#!/usr/bin/env node
var fs = require("fs"),
    path = require("path"),
    Assembler = require("../src/assembler");

var argv = require("yargs")
    .usage("Usage: $0 [options] input_file")
    .example("$0 --out-file bin/game.nes src/main.asm")
    .describe("out-file", "Explicitly set the output file")
    .boolean("list-pcbs")
    .describe("list-pcbs", "List all built-in PCB macros")
    .help("h")
    .alias("h", "help")
    .epilog("Copyright (C) 2016 Norman B. Lancaster\nReleased under the terms of the MIT License")
    .argv;

if(argv["list-pcbs"]) {
    console.log("Macro    Mapper PRG  CHR  SRAM Battery?");
    console.log("NROM     None   32K  8K   None N/A");
    console.log("SEROM    MMC1   32K  128K None N/A");
    console.log("SIROM    MMC1   32K  128K 8K   Yes");
    console.log("SLROM    MMC1   256K 128K None N/A");
    console.log("SJROM    MMC1   256K 128K 8K   No");
    console.log("SKROM    MMC1   256K 256K 8K   Yes");
    console.log("SGROM    MMC1   256K RAM  None N/A");
    console.log("SNROM    MMC1   256K RAM  8K   Yes");
    console.log("SUROM    MMC1   512K RAM  8K   Yes");
    console.log("UNROM    UxROM  128K RAM  None N/A");
    console.log("CNROM    CxROM  32K  128K None N/A");
    console.log("TLROM    MMC3   512K 256K None N/A");
    console.log("TSROM    MMC3   512K 256K 8K   No");
    console.log("TKROM    MMC3   512K 256K 8K   Yes");
    console.log("TGROM    MMC3   512K RAM  None No");
    console.log("TNROM    MMC3   512K RAM  8K   Yes");
    console.log("PNROM    MMC2   256K 128K None N/A");
    console.log("PKROM    MMC2   256K 128K 8K   Yes");
    console.log("FKROM    MMC4   256K 128K 8K   Yes");
    process.exit(1);
}

if(argv._.length < 1) {
    console.log("No input file");
    process.exit(1);
}

if(argv._.length > 1) {
    console.log("Only specify one input file");
    process.exit(1);
}

try {
    var asm = new Assembler();
    var inFileName = argv._[0];
    asm.compileFile(path.resolve(inFileName), fs.readFileSync(inFileName));
    var outFileName = path.basename(inFileName) + ".nes";
    if(argv["out-file"]) {
        outFileName = argv["out-file"];
    }
    fs.writeFileSync(outFileName, asm.getOutputBuffer());
} catch(e) {
    if(e.line !== undefined) {
        console.log(e.message);
    } else {
        console.log(e.message, e.stack);
    }
    process.exit(1);
}
