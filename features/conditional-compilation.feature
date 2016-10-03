Feature: Conditional Compilation
    As a Developer
    I want to conditional include or exclue portions of code
    So that I can support multiple build targes with a single source code base

    Scenario: Define flag
        When compiling the line "flag doStuff"
        Then the "doStuff" flag should be true
    
    Scenario: Define flag with optional on keyword
        When compiling the line "flag on doStuff"
        Then the "doStuff" flag should be true
    
    Scenario: Undefine flag
        When compiling the line "flag off debug"
        Then the "debug" flag should be false
    
    Scenario: If keyword
        When compiling a file with an if statement that evaluates true
        Then the code within the if statement should have compiled
    
    Scenario: If keyword false
        When compiling a file with an if statement that evaluates false
        Then the code within the if statement should not have compiled

    Scenario: Not keyword
        When compiling a file with an if statement that evaluates true with the optional not keywork
        Then the code within the if statement should not have compiled
    
    Scenario: Else keyword with true if
        When compiling a file with an if-else statement that evaluates true
        Then the code within the else statement should not have compiled

    Scenario: Else keyword with false if
        When compiling a file with an if-else statement that evaluates false
        Then the code within the else statement should have compiled
