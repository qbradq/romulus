Feature: Labels
    As a Developer
    I want to label areas of generated code
    So that I can easily write relocatable code

    Scenario: Label definition
        When compiling the line "testLabel:"
        Then the label "testLabel" should be 0x8000
    
    Scenario: Codepage keyword
        When compiling the line "codepage $C000, $4000 testLabel:"
        Then the label "testLabel" should be 0xC000
    
    Scenario: Scope keyword
        When compiling the line "scope test { label: }"
        Then the label "test" should be 0x8000
        And the label "test.label" should be 0x8000
    
    Scenario: Scope dereference
        When compiling the line "scope test { label: } bcc test.label"
        Then the compiled output should be "90FE00"
    
    Scenario: Outer scope reference
        When compiling the line "scope t1 { l: scope t2 { bcc l }}"
        Then the compiled output should be "90FE00"
    