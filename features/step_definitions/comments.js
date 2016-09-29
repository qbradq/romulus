module.exports = function() {
    this.When(/^assembling a line containing only a line comment$/, function (callback) {
        this.asm.parse("test", "// This is a single-line comment");
        callback();
    });

    this.When(/^assembling a file containing only a block comment$/, function (callback) {
        this.asm.parse("test", "/* This is a block * comment */");
        callback();
    });

    this.When(/^assembling a file containing a block comment with newlines$/, function (callback) {
        this.asm.parse("test", "/* This is a block\n * comment\n */");
        callback();
    });

    this.When(/^assembling a file containing nested block comments$/, function (callback) {
        this.asm.parse("test", "/* Even /* nested /* comments */ are */ supported */");
        callback();
    });
};
