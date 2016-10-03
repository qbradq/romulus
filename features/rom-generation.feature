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
