var assert = require("assert"),
    Lexer = require("../src/lexer.js");

describe("Lexer", function() {
    var uut;

    beforeEach(function() {
        uut = new Lexer();
    });

    describe("token", function() {
        it("ignores whitespace", function() {
            var tokens = uut.lex("test", "    ");
            assert.equal(tokens.length, 0);
        });

        it("ignores line comments", function() {
            var tokens = uut.lex("test", "  // Stuff and junk\n  ");
            assert.equal(tokens.length, 0);
        });

        it("ignores block comments", function() {
            var tokens = uut.lex("test", "/* Stuff /* and */ /* junk */ */  \n");
            assert.equal(tokens.length, 0);
        });

        it("recognizes identifiers", function() {
            var tokens = uut.lex("test", "  asdf _0000 iAmTheVeryModelOfAModerMajorGeneral ");
            assert.equal(tokens.length, 3);
            assert.equal(tokens[0].type, "identifier");
            assert.equal(tokens[0].value, "asdf");
            assert.equal(tokens[1].type, "identifier");
            assert.equal(tokens[1].value, "_0000");
            assert.equal(tokens[2].type, "identifier");
            assert.equal(tokens[2].value, "iAmTheVeryModelOfAModerMajorGeneral");
        });

        it("differentiates keywords", function() {
            var tokens = uut.lex("test", "origin");
            assert.equal(tokens.length, 1);
            assert.equal(tokens[0].type, "keyword");
            assert.equal(tokens[0].value, "origin");
        });
        
        it("differentiates opcodes", function() {
            var tokens = uut.lex("test", "lda");
            assert.equal(tokens.length, 1);
            assert.equal(tokens[0].type, "opcode");
            assert.equal(tokens[0].value, "lda");
        });

        it("recognizes all opcodes", function() {
            var opstr = "ADC AND ASL BCC BCS BEQ BIT BMI BNE BPL BRK BVC BVS CLC CLD CLI CLV CMP CPX CPY DEC DEX DEY EOR INC INX INY JMP JSR LDA LDX LDY LSR NOP ORA PHA PHP PLA PLP ROL ROR RTI RTS SBC SEC SED SEI STA STX STY TAX TAY TSX TXA TXS TYA".toLowerCase();
            var opCodes = opstr.split(" ");
            var tokens = uut.lex("test", opstr);
            assert.equal(tokens.length, opCodes.length);
            for(var i = 0; i < opCodes.length; ++i) {
                assert.equal(tokens[i].type, "opcode");
                assert.equal(tokens[i].value, opCodes[i]);
            }
        });

        it("recognizes c-style hexadecimal numbers", function() {
            var tokens = uut.lex("test", "0x64");
            assert.equal(tokens.length, 1);
            assert.equal(tokens[0].type, "number");
            assert.equal(tokens[0].value, 100);
        });

        it("recognizes traditional hexadecimal numbers", function() {
            var tokens = uut.lex("test", "$64");
            assert.equal(tokens.length, 1);
            assert.equal(tokens[0].type, "number");
            assert.equal(tokens[0].value, 100);
        });

        it("recognizes decimal numbers", function() {
            var tokens = uut.lex("test", "100");
            assert.equal(tokens.length, 1);
            assert.equal(tokens[0].type, "number");
            assert.equal(tokens[0].value, 100);
        });

        it("recognizes c-style octal numbers", function() {
            var tokens = uut.lex("test", "0144");
            assert.equal(tokens.length, 1);
            assert.equal(tokens[0].type, "number");
            assert.equal(tokens[0].value, 100);
        });

        it("recognizes c-style binary numbers", function() {
            var tokens = uut.lex("test", "0b01100100");
            assert.equal(tokens.length, 1);
            assert.equal(tokens[0].type, "number");
            assert.equal(tokens[0].value, 100);
        });

        it("recognizes traditional binary numbers", function() {
            var tokens = uut.lex("test", "%01100100");
            assert.equal(tokens.length, 1);
            assert.equal(tokens[0].type, "number");
            assert.equal(tokens[0].value, 100);
        });

        it("recognizes simple strings", function() {
            var tokens = uut.lex("test", "\"stuff and junk\"");
            assert.equal(tokens.length, 1);
            assert.equal(tokens[0].type, "string");
            assert.equal(tokens[0].value, "stuff and junk");
        });

        it("recognizes newline escapements in strings", function() {
            var tokens = uut.lex("test", "\"s\\ntuff and junk\"");
            assert.equal(tokens.length, 1);
            assert.equal(tokens[0].type, "string");
            assert.equal(tokens[0].value, "s\ntuff and junk");
        });

        it("recognizes tab escapements in strings", function() {
            var tokens = uut.lex("test", "\"stuff\\tand junk\"");
            assert.equal(tokens.length, 1);
            assert.equal(tokens[0].type, "string");
            assert.equal(tokens[0].value, "stuff\tand junk");
        });

        it("recognizes backslash escapements in strings", function() {
            var tokens = uut.lex("test", "\"stuff and \\\\ junk\"");
            assert.equal(tokens.length, 1);
            assert.equal(tokens[0].type, "string");
            assert.equal(tokens[0].value, "stuff and \\ junk");
        });

        it("recognizes double-quote escapements in strings", function() {
            var tokens = uut.lex("test", "\"stuff \\\"and junk\"");
            assert.equal(tokens.length, 1);
            assert.equal(tokens[0].type, "string");
            assert.equal(tokens[0].value, "stuff \"and junk");
        });

        it("recognizes octal escapements in strings", function() {
            var tokens = uut.lex("test", "\"stuff \\141nd junk\"");
            assert.equal(tokens.length, 1);
            assert.equal(tokens[0].type, "string");
            assert.equal(tokens[0].value, "stuff and junk");
        });

        it("recognizes hexadecimal escapements in strings", function() {
            var tokens = uut.lex("test", "\"stuff \\x61nd junk\"");
            assert.equal(tokens.length, 1);
            assert.equal(tokens[0].type, "string");
            assert.equal(tokens[0].value, "stuff and junk");
        });

        it("recognizes all operators", function() {
            var tokens = uut.lex("test", "()[]{},+-*#<>.:");
            assert.equal(tokens.length, 16);
            assert.equal(tokens[0].type, "operator");
            assert.equal(tokens[0].value, "left-parenthesis");
            assert.equal(tokens[1].type, "operator");
            assert.equal(tokens[1].value, "right-parenthesis");
            assert.equal(tokens[2].type, "operator");
            assert.equal(tokens[2].value, "left-bracket");
            assert.equal(tokens[3].type, "operator");
            assert.equal(tokens[3].value, "right-bracket");
            assert.equal(tokens[4].type, "operator");
            assert.equal(tokens[4].value, "left-brace");
            assert.equal(tokens[5].type, "operator");
            assert.equal(tokens[5].value, "right-brace");
            assert.equal(tokens[6].type, "operator");
            assert.equal(tokens[6].value, "comma");
            assert.equal(tokens[7].type, "operator");
            assert.equal(tokens[7].value, "plus");
            assert.equal(tokens[8].type, "operator");
            assert.equal(tokens[8].value, "minus");
            assert.equal(tokens[9].type, "operator");
            assert.equal(tokens[9].value, "asterisk");
            assert.equal(tokens[10].type, "operator");
            assert.equal(tokens[10].value, "octothorpe");
            assert.equal(tokens[11].type, "operator");
            assert.equal(tokens[11].value, "left-chevron");
            assert.equal(tokens[12].type, "operator");
            assert.equal(tokens[12].value, "right-chevron");
            assert.equal(tokens[13].type, "operator");
            assert.equal(tokens[13].value, "period");
            assert.equal(tokens[14].type, "operator");
            assert.equal(tokens[14].value, "colon");
        });
    });
});
