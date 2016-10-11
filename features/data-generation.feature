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
    
    Scenario: Out word label
        When compiling the line "out word label label:"
        Then PRG ROM byte 0x0000 should be 0x02
        And PRG ROM byte 0x0001 should be 0x80

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
    
    Scenario: ASCII with modifier
        When compiling the line "ascii "Hello World!", 2"
        Then PRG ROM byte 0x0000 should be 0x4a
        And PRG ROM byte 0x000B should be 0x23
    
    Scenario Outline: Table of bytes
        When compiling the line "table byte test $12, $34, $56, $78"
        Then PRG ROM byte <addr> should be <value>
    
    Examples:
        | addr   | value |
        | 0x0000 | 0x12  |
        | 0x0001 | 0x34  |
        | 0x0002 | 0x56  |
        | 0x0003 | 0x78  |

    Scenario Outline: Table of words
        When compiling the line "table word test $1234, $5678"
        Then PRG ROM byte <addr> should be <value>
    
    Examples:
        | addr   | value |
        | 0x0000 | 0x34  |
        | 0x0001 | 0x78  |
        | 0x0002 | 0x12  |
        | 0x0003 | 0x56  |

    Scenario Outline: Table of triplets
        When compiling the line "table triplet test $123456, $789ABC"
        Then PRG ROM byte <addr> should be <value>
    
    Examples:
        | addr   | value |
        | 0x0000 | 0x56  |
        | 0x0001 | 0xBC  |
        | 0x0002 | 0x34  |
        | 0x0003 | 0x9A  |
        | 0x0004 | 0x12  |
        | 0x0005 | 0x78  |

    Scenario Outline: Table of double words
        When compiling the line "table dword test $12345678, $9ABCDEF0"
        Then PRG ROM byte <addr> should be <value>
    
    Examples:
        | addr   | value |
        | 0x0000 | 0x78  |
        | 0x0001 | 0xF0  |
        | 0x0002 | 0x56  |
        | 0x0003 | 0xDE  |
        | 0x0004 | 0x34  |
        | 0x0005 | 0xBC  |
        | 0x0006 | 0x12  |
        | 0x0007 | 0x9A  |
