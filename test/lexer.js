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
            assert.equal(uut.tokens[0].value, "asdf");
            assert.equal(uut.tokens[1].type, "identifier");
            assert.equal(uut.tokens[1].value, "_0000");
            assert.equal(uut.tokens[2].type, "identifier");
            assert.equal(uut.tokens[2].value, "iAmTheVeryModelOfAModerMajorGeneral");
        });

        it("differentiates keywords", function() {
            uut.lex("test", "  my origin story ");
            assert.equal(uut.tokens.length, 3);
            assert.equal(uut.tokens[0].type, "identifier");
            assert.equal(uut.tokens[0].value, "my");
            assert.equal(uut.tokens[1].type, "keyword");
            assert.equal(uut.tokens[1].value, "origin");
            assert.equal(uut.tokens[2].type, "identifier");
            assert.equal(uut.tokens[2].value, "story");
        });

        it("recognizes c-style hexadecimal numbers", function() {
            uut.lex("test", "0x64");
            assert.equal(uut.tokens.length, 1);
            assert.equal(uut.tokens[0].type, "number");
            assert.equal(uut.tokens[0].value, 100);
        });

        it("recognizes traditional hexadecimal numbers", function() {
            uut.lex("test", "$64");
            assert.equal(uut.tokens.length, 1);
            assert.equal(uut.tokens[0].type, "number");
            assert.equal(uut.tokens[0].value, 100);
        });

        it("recognizes decimal numbers", function() {
            uut.lex("test", "100");
            assert.equal(uut.tokens.length, 1);
            assert.equal(uut.tokens[0].type, "number");
            assert.equal(uut.tokens[0].value, 100);
        });

        it("recognizes c-style octal numbers", function() {
            uut.lex("test", "0144");
            assert.equal(uut.tokens.length, 1);
            assert.equal(uut.tokens[0].type, "number");
            assert.equal(uut.tokens[0].value, 100);
        });

        it("recognizes c-style binary numbers", function() {
            uut.lex("test", "0b01100100");
            assert.equal(uut.tokens.length, 1);
            assert.equal(uut.tokens[0].type, "number");
            assert.equal(uut.tokens[0].value, 100);
        });

        it("recognizes traditional binary numbers", function() {
            uut.lex("test", "%01100100");
            assert.equal(uut.tokens.length, 1);
            assert.equal(uut.tokens[0].type, "number");
            assert.equal(uut.tokens[0].value, 100);
        });

        it("recognizes simple strings", function() {
            uut.lex("test", "\"stuff and junk\"");
            assert.equal(uut.tokens.length, 1);
            assert.equal(uut.tokens[0].type, "string");
            assert.equal(uut.tokens[0].value, "stuff and junk");
        });

        it("recognizes newline escapements in strings", function() {
            uut.lex("test", "\"s\\ntuff and junk\"");
            assert.equal(uut.tokens.length, 1);
            assert.equal(uut.tokens[0].type, "string");
            assert.equal(uut.tokens[0].value, "s\ntuff and junk");
        });

        it("recognizes tab escapements in strings", function() {
            uut.lex("test", "\"stuff\\tand junk\"");
            assert.equal(uut.tokens.length, 1);
            assert.equal(uut.tokens[0].type, "string");
            assert.equal(uut.tokens[0].value, "stuff\tand junk");
        });

        it("recognizes backslash escapements in strings", function() {
            uut.lex("test", "\"stuff and \\\\ junk\"");
            assert.equal(uut.tokens.length, 1);
            assert.equal(uut.tokens[0].type, "string");
            assert.equal(uut.tokens[0].value, "stuff and \\ junk");
        });

        it("recognizes double-quote escapements in strings", function() {
            uut.lex("test", "\"stuff \\\"and junk\"");
            assert.equal(uut.tokens.length, 1);
            assert.equal(uut.tokens[0].type, "string");
            assert.equal(uut.tokens[0].value, "stuff \"and junk");
        });

        it("recognizes octal escapements in strings", function() {
            uut.lex("test", "\"stuff \\141nd junk\"");
            assert.equal(uut.tokens.length, 1);
            assert.equal(uut.tokens[0].type, "string");
            assert.equal(uut.tokens[0].value, "stuff and junk");
        });

        it("recognizes hexadecimal escapements in strings", function() {
            uut.lex("test", "\"stuff \\x61nd junk\"");
            assert.equal(uut.tokens.length, 1);
            assert.equal(uut.tokens[0].type, "string");
            assert.equal(uut.tokens[0].value, "stuff and junk");
        });

        it("recognizes all operators", function() {
            uut.lex("test", "()[]{},+-*/&<>.");
            assert.equal(uut.tokens.length, 15);
            assert.equal(uut.tokens[0].type, "operator");
            assert.equal(uut.tokens[0].value, "left-parenthesis");
            assert.equal(uut.tokens[1].type, "operator");
            assert.equal(uut.tokens[1].value, "right-parenthesis");
            assert.equal(uut.tokens[2].type, "operator");
            assert.equal(uut.tokens[2].value, "left-bracket");
            assert.equal(uut.tokens[3].type, "operator");
            assert.equal(uut.tokens[3].value, "right-bracket");
            assert.equal(uut.tokens[4].type, "operator");
            assert.equal(uut.tokens[4].value, "left-brace");
            assert.equal(uut.tokens[5].type, "operator");
            assert.equal(uut.tokens[5].value, "right-brace");
            assert.equal(uut.tokens[6].type, "operator");
            assert.equal(uut.tokens[6].value, "comma");
            assert.equal(uut.tokens[7].type, "operator");
            assert.equal(uut.tokens[7].value, "plus");
            assert.equal(uut.tokens[8].type, "operator");
            assert.equal(uut.tokens[8].value, "minus");
            assert.equal(uut.tokens[9].type, "operator");
            assert.equal(uut.tokens[9].value, "asterisk");
            assert.equal(uut.tokens[10].type, "operator");
            assert.equal(uut.tokens[10].value, "forward-slash");
            assert.equal(uut.tokens[11].type, "operator");
            assert.equal(uut.tokens[11].value, "ampersand");
            assert.equal(uut.tokens[12].type, "operator");
            assert.equal(uut.tokens[12].value, "left-chevron");
            assert.equal(uut.tokens[13].type, "operator");
            assert.equal(uut.tokens[13].value, "right-chevron");
            assert.equal(uut.tokens[14].type, "operator");
            assert.equal(uut.tokens[14].value, "period");
        });
    });
});
