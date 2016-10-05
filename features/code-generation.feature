Feature: Code generation
    As a Developer
    I want the compiler to generate machine code instructions
    So that I can write program code using easy to remember nemonics

    Scenario Outline: Opcode correctness
        When compiling the line "<line>"
        Then the compiled output should be "<hex>"
    
    Examples:
        | line          | hex    |
        | adc 7         | 690700 |
        | adc *0x32     | 653200 |
        | adc *0x88,x   | 758800 |
        | adc *0x1234   | 6D3412 |
        | adc *0x789A,x | 7D9A78 |
        | adc *0x5AA5,y | 79A55A |
        | adc (*0x12,x) | 611200 |
        | adc (*0x23),y | 712300 |
        | and 8         | 290800 |
        | and *$22      | 252200 |
        | and *1,x      | 350100 |
        | and *0x1997   | 2D9719 |
        | and *$2233,x  | 3D3322 |
        | and *$4455,y  | 395544 |
        | and (*$66,x)  | 216600 |
        | and (*$77),y  | 317700 |
        | asl           | 0A0000 |
        | asl *0x72     | 067200 |
        | asl *0x32,x   | 163200 |
        | asl *0x8228   | 0E2882 |
        | asl *0x9988,x | 1E8899 |
        