Feature: Skipto Keyword
    As a Developer
    I want to skip to descrete CPU addresses during code generation
    To ease the layout of data within the ROM image

    Scenario: skipto keyword
        When compiling the line "prgbank 0 codepage $C000, $4000 skipto $FFFA out byte $5A"
        Then PRG ROM byte 0x3FFA should be 0x5A
