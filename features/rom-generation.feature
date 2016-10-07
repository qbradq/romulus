Feature: ROM Generation
    As a Developer
    I want automatic iNES 1 format ROM output
    So that I can easily create a standards-compliant output file

    Scenario: ROM generation correct size
        Given capability "prgrom" is 5
        And capability "chrrom" is 3
        When compiling nothing
        Then the PRG ROM size should be 81920
        And the CHR ROM size should be 24576
        And the output file size should be 106512
    
    Scenario: prgbank keyword
        Given capability "prgrom" is 8
        When compiling the line "prgbank 4 nop"
        Then PRG ROM byte 0x10000 should be 0xEA

    Scenario: prgofs keyword
        Given capability "prgrom" is 8
        When compiling the line "prgofs 0x1234 nop"
        Then PRG ROM byte 0x1234 should be 0xEA

    Scenario: chrbank keyword
        Given capability "chrrom" is 4
        When compiling the line "chrbank 2 out byte 0xF1"
        Then CHR ROM byte 0x4000 should be 0xF1

    Scenario: chrofs keyword
        Given capability "chrrom" is 4
        When compiling the line "chrofs 0x1234 out byte 0xF1"
        Then CHR ROM byte 0x1234 should be 0xF1
