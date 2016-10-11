Feature: Skipto Keyword
    As a Developer
    I want to skip to descrete CPU addresses during code generation
    To ease the layout of data within the ROM image

    Scenario: skipto keyword
        When compiling the line "prgbank 0 codepage $C000, $4000 skipto $FFFA out byte $5A"
        Then PRG ROM byte 0x3FFA should be 0x5A

    Scenario: skipto zero offset
        When compiling the line "prgbank 0 codepage $C000, $4000 skipto $C000 out byte $12"
        Then PRG ROM byte 0x0000 should be 0x12

    Scenario: skipto zero offset from origin
        When compiling the line "prgbank 0 codepage $C000, $4000 skipto $FFFA out byte $12 skipto $FFFB out byte $34"
        Then PRG ROM byte 0x3FFA should be 0x12
        And PRG ROM byte 0x3FFB should be 0x34
