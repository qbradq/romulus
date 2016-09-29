var assert = require("assert"),
    Lexer = require("../src/lexer.js");

describe("Lexer", function() {
    var uut;

    beforeEach(function() {
        uut = new Lexer();
    });

    describe("token", function() {
        it("ignores whitespace", function() {
            uut.startLex("test", "    ");
            var token = uut.token();
            assert.equal(token, null);
            assert(uut.eof(), "Tokenization halted at " +
                uut.file + ":" + uut.line + ":" + uut.char);
        });

        it("ignores line comments", function() {
            uut.lex("test", "  // Stuff and junk\n  ");
            assert.equal(uut.tokens.length, 0);
        });

        it("ignores block comments", function() {
            uut.lex("test", "/* Stuff /* and */ /* junk */ */  \n");
            assert.equal(uut.tokens.length, 0);
        });

        it("recognizes identifiers", function() {
            uut.lex("test", "  asdf _0000 iAmTheVeryModelOfAModerMajorGeneral ");
            assert.equal(uut.tokens.length, 3);
            assert.equal(uut.tokens[0].type, "identifier");
            assert.equal(uut.tokens[0].name, "asdf");
            assert.equal(uut.tokens[1].type, "identifier");
            assert.equal(uut.tokens[1].name, "_0000");
            assert.equal(uut.tokens[2].type, "identifier");
            assert.equal(uut.tokens[2].name, "iAmTheVeryModelOfAModerMajorGeneral");
        });
    });
});
