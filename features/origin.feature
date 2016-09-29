Feature: Origin
    As a Developer
    I want to set the origin address of code
    So that I can place it at the correct machine address

    Scenario: Origin traditional hexadecimal
        When assembling an origin directive with the parameter "$1000"
        Then the pc should equal 4096
    
    Scenario: Origin c-style hexadecimal
        When assembling an origin directive with the parameter "0x1001"
        Then the pc should equal 4097
    
    Scenario: Origin decimal
        When assembling an origin directive with the parameter "1000"
        Then the pc should equal 1000
    
    Scenario: Origin octal
        When assembling an origin directive with the parameter "01000"
        Then the pc should equal 512
    
    Scenario: Origin traditional binary
        When assembling an origin directive with the parameter "%1000"
        Then the pc should equal 8
    
    Scenario: Origin c-style binary
        When assembling an origin directive with the parameter "0b1001"
        Then the pc should equal 9
    
    Scenario: Origin label
        Given label "reset" equals "32768"
        When assembling an origin directive with the parameter "reset"
        Then the pc should equal 32768
