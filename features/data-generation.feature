Feature: Data Generation
    As a Developer
    I want to generate raw data in the output ROM image
    So that I can tightly control data layout

    Scenario: Out byte
        When compiling the line "out byte $5a"
        Then PRG ROM byte 0x0000 should be 0x5A
    
    Scenario: Out word
        When compiling the line "out word $5aa5"
        Then PRG ROM byte 0x0000 should be 0xA5
        And PRG ROM byte 0x0001 should be 0x5A

    Scenario: Out triplet
        When compiling the line "out triplet $5aa5d7"
        Then PRG ROM byte 0x0000 should be 0xD7
        And PRG ROM byte 0x0001 should be 0xA5
        And PRG ROM byte 0x0002 should be 0x5A

    Scenario: Out double word
        When compiling the line "out dword $935aa5d7"
        Then PRG ROM byte 0x0000 should be 0xD7
        And PRG ROM byte 0x0001 should be 0xA5
        And PRG ROM byte 0x0002 should be 0x5A
        And PRG ROM byte 0x0003 should be 0x93
    
    Scenario: ASCII no modifier
        When compiling the line "ascii "Hello World!""
        Then PRG ROM byte 0x0000 should be 0x48
        And PRG ROM byte 0x000B should be 0x21
    
    Scenario: ASCII positive modifier
        When compiling the line "ascii "Hello World!", 2"
        Then PRG ROM byte 0x0000 should be 0x4a
        And PRG ROM byte 0x000B should be 0x23
    
    Scenario: ASCII negative modifier
        When compiling the line "ascii "Hello World!", -0x20"
        Then PRG ROM byte 0x0000 should be 0x28
        And PRG ROM byte 0x000B should be 0x01
    