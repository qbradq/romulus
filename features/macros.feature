Feature: Macros
    As a Developer
    I want to associate numbers, addresses, and code snippets with meaningful names
    So that I can make my code more readable and reuseable

    Scenario: Macro simple replacement
        When compiling the line "define test { $7F } out byte test"
        Then PRG ROM byte 0x0000 should be 0x7F
    