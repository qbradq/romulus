Feature: Comments
    As a Developer
    I want to add comments to my code
    So that I can add information to make it more readable

    Scenario: Line comments
        When assembling a line containing only a line comment
        Then no action should be taken
    
    Scenario: Block comments
        When assembling a file containing only a block comment
        Then no action should be taken
    
    Scenario: Block comments with newlines
        When assembling a file containing a block comment with newlines
        Then no action should be taken
    
    Scenario: Nested block comments
        When assembling a file containing nested block comments
        Then no action should be taken
    