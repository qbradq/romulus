Feature: Capabilities
    As a Developer
    I want to specifiy PCB capabilities
    So that I can target more than one PCB with thie compiler

    Scenario Outline: Set capability
        When setting capability "<name>" to "<value>"
        Then capability "<name>" should be "<target>"
    
    Examples:
        | name        | value      | target     |
        | mapper      | 17         | 17         |
        | busconflict | on         | true       |
        | busconflict | off        | false      |
        | prgrom      | 9          | 9          |
        | chrrom      | 2          | 2          |
        | mirroring   | vertical   | vertical   |
        | mirroring   | horizontal | horizontal |
        | mirroring   | fourscreen | fourscreen |
        | sram        | on         | true       |
        | sram        | off        | false      |
        | pal         | on         | true       |
        | pal         | off        | false      |
