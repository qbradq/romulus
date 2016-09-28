Feature: Comments
    As a Developer
    I want to add comments to my code
    So that I can add information to make it more readable

    Scenario: Line comments
        When a line is encountered containing a line comment
        Then no action should be taken
        And the line number should be 2
    