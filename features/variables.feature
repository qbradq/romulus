Feature: Variables
    As a Developer
    I want to researve RAM for use
    So that I can maintain program state

    Background:
        Given capability "sram" is off

    Scenario: Byte variable
        When compiling the line "byte foo"
        Then the label "foo" should be allocated in the WRAM segment
        And the label "foo.a" should be allocated in the WRAM segment
    
    Scenario: Word variable
        When compiling the line "word foo"
        Then the label "foo" should be allocated in the WRAM segment
        And the label "foo.a" should be allocated in the WRAM segment
        And the label "foo.b" should be allocated in the WRAM segment

    Scenario: Triplet variable
        When compiling the line "triplet foo"
        Then the label "foo" should be allocated in the WRAM segment
        And the label "foo.a" should be allocated in the WRAM segment
        And the label "foo.b" should be allocated in the WRAM segment
        And the label "foo.c" should be allocated in the WRAM segment

    Scenario: Double word variable
        When compiling the line "dword foo"
        Then the label "foo" should be allocated in the WRAM segment
        And the label "foo.a" should be allocated in the WRAM segment
        And the label "foo.b" should be allocated in the WRAM segment
        And the label "foo.c" should be allocated in the WRAM segment
        And the label "foo.d" should be allocated in the WRAM segment

    Scenario: Fast variable
        When compiling the line "fast byte foo"
        Then the label "foo" should be allocated in the ZEROPAGE segment
        And the label "foo.a" should be allocated in the ZEROPAGE segment

    Scenario: Static variable
        Given capability "sram" is on
        When compiling the line "static byte foo"
        Then the label "foo" should be allocated in the SRAM segment
        And the label "foo.a" should be allocated in the SRAM segment
    
    Scenario: Array variable
        When compiling the line "byte[0x100] foo"
        Then the length of label "foo" should be 256
        And the length of label "foo.a" should be 256
