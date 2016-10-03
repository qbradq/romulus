Feature: Include keyword
    As a Developer
    I want to split my code into multiple files
    So that code is more managable and reusable

    Scenario: Include relative path
        When compiling a file containing a relative path include statement
        Then the included file should have been compiled

#    This scenario is not machine-testable without being system dependant   
#    Scenario: Include absolute path
#        When compiling a file containing an absolute path include statement
#        Then the included file should have been compiled
