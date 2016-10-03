Feature: Capabilities
    As a Developer
    I want to specifiy PCB capabilities
    So that I can target more than one PCB with thie compiler

    Scenario: Set mapper capability
        When compiling the line "capability mapper 17"
        Then capability "mapper" should be 17
    
    Scenario: Set busconflict capability 
        When compiling the line "capability busconflict on"
        Then capability "busconflict" should be true
    
    Scenario: Set PRG-ROM capability
        When compiling the line "capability prgrom 8"
        Then capability "prgrom" should be 8

    Scenario: Set CHR-ROM capability
        When compiling the line "capability chrrom 2"
        Then capability "chrrom" should be 2

    Scenario: Set mirroring capability vertical
        When compiling the line "capability mirroring vertical"
        Then capability "mirroring" should be "vertical"

    Scenario: Set mirroring capability horizontal
        When compiling the line "capability mirroring horizontal"
        Then capability "mirroring" should be "horizontal"

    Scenario: Set mirroring capability fourscreen
        When compiling the line "capability mirroring fourscreen"
        Then capability "mirroring" should be "fourscreen"

    Scenario: Set sram capability 
        When compiling the line "capability sram off"
        Then capability "sram" should be false

    Scenario: Set pal capability 
        When compiling the line "capability pal off"
        Then capability "pal" should be false
