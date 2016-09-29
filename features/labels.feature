Feature: Labels
    As a Developer
    I want to label addresses
    So that I can refer to them by name

    Scenario: Positional label definition
        Given the pc is 32768
        When a positional definition for label "foo" is encountered
        And assembly completes
        Then label "foo" should equal 32768
    
    Scenario: Litteral label definition
        When a litteral definition for label "foo" at address "$2002" is encountered
        And assembly completes
        Then label "foo" should equal 8194
    