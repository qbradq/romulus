Feature: Labels
    As a Developer
    I want to label areas of generated code
    So that I can easily write relocatable code

    Scenario: Label definition
        When compiling the line "testLabel:"
        Then the label "testLabel" should be 0x8000
