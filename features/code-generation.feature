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
        | bcc *0x8000   | 90FE00 |
        | bcs *0x8010   | B00E00 |
        | beq *0x8000   | F0FE00 |
        | bit *0x0F     | 240F00 |
        | bit *0xEFDD   | 2CDDEF |
        | bmi *0x8000   | 30FE00 |
        | bne *0x8000   | D0FE00 |
        | bpl *0x8000   | 10FE00 |
        | brk           | 000000 |
        | bvc *0x8000   | 50FE00 |
        | bvs *0x8000   | 70FE00 |
        | clc           | 180000 |
        | cld           | D80000 |
        | cli           | 580000 |
        | clv           | B80000 |
        | cmp 7         | C90700 |
        | cmp *$32      | C53200 |
        | cmp *$22,x    | D52200 |
        | cmp *$2345    | CD4523 |
        | cmp *$1234,x  | DD3412 |
        | cmp *$5678,y  | D97856 |
        | cmp (*0x21,x) | C12100 |
        | cmp (*0x34),y | D13400 |
        | cpx 9         | E00900 |
        | cpx *$21      | E42100 |
        | cpx *$1234    | EC3412 |
        | cpy 10        | C00A00 |
        | cpy *$12      | C41200 |
        | cpy *$3456    | CC5634 |
        | dec *0xFF     | C6FF00 |
        | dec *0x40,x   | D64000 |
        | dec *0x1234   | CE3412 |
        | dec *0x5678,x | DE7856 |
        | dex           | CA0000 |
        | dey           | 880000 |
        | eor 7         | 490700 |
        | eor *$32      | 453200 |
        | eor *$22,x    | 552200 |
        | eor *$2345    | 4D4523 |
        | eor *$1234,x  | 5D3412 |
        | eor *$5678,y  | 597856 |
        | eor (*0x21,x) | 412100 |
        | eor (*0x34),y | 513400 |
        | inc *0xFF     | E6FF00 |
        | inc *0x40,x   | F64000 |
        | inc *0x1234   | EE3412 |
        | inc *0x5678,x | FE7856 |
        | inx           | E80000 |
        | iny           | C80000 |
        | jmp *$FEEF    | 4CEFFE |
        | jmp (*$FFFC)  | 6CFCFF |
        | jsr *$8090    | 209080 |
        | lda 7         | A90700 |
        | lda *$32      | A53200 |
        | lda *$22,x    | B52200 |
        | lda *$2345    | AD4523 |
        | lda *$1234,x  | BD3412 |
        | lda *$5678,y  | B97856 |
        | lda (*0x21,x) | A12100 |
        | lda (*0x34),y | B13400 |
        | ldx 7         | A20700 |
        | ldx *$32      | A63200 |
        | ldx *$22,y    | B62200 |
        | ldx *$2345    | AE4523 |
        | ldx *$5678,y  | BE7856 |
        | ldy 7         | A00700 |
        | ldy *$32      | A43200 |
        | ldy *$22,x    | B42200 |
        | ldy *$2345    | AC4523 |
        | ldy *$5678,x  | BC7856 |
        | lsr           | 4A0000 |
        | lsr *$32      | 463200 |
        | lsr *$22,x    | 562200 |
        | lsr *$2345    | 4E4523 |
        | lsr *$5678,x  | 5E7856 |
        | nop           | EA0000 |
        | ora 7         | 090700 |
        | ora *$32      | 053200 |
        | ora *$22,x    | 152200 |
        | ora *$2345    | 0D4523 |
        | ora *$1234,x  | 1D3412 |
        | ora *$5678,y  | 197856 |
        | ora (*0x21,x) | 012100 |
        | ora (*0x34),y | 113400 |
        | pha           | 480000 |
        | php           | 080000 |
        | pla           | 680000 |
        | plp           | 280000 |
        | rol           | 2A0000 |
        | rol *$32      | 263200 |
        | rol *$22,x    | 362200 |
        | rol *$2345    | 2E4523 |
        | rol *$5678,x  | 3E7856 |
        | ror           | 6A0000 |
        | ror *$32      | 663200 |
        | ror *$22,x    | 762200 |
        | ror *$2345    | 6E4523 |
        | ror *$5678,x  | 7E7856 |
        | rti           | 400000 |
        | rts           | 600000 |
        | sbc 7         | E90700 |
        | sbc *0x32     | E53200 |
        | sbc *0x88,x   | F58800 |
        | sbc *0x1234   | ED3412 |
        | sbc *0x789A,x | FD9A78 |
        | sbc *0x5AA5,y | F9A55A |
        | sbc (*0x12,x) | E11200 |
        | sbc (*0x23),y | F12300 |
        | sec           | 380000 |
        | sed           | F80000 |
        | sei           | 780000 |
        | sta *0x32     | 853200 |
        | sta *0x88,x   | 958800 |
        | sta *0x1234   | 8D3412 |
        | sta *0x789A,x | 9D9A78 |
        | sta *0x5AA5,y | 99A55A |
        | sta (*0x12,x) | 811200 |
        | sta (*0x23),y | 912300 |
        | stx *0x32     | 863200 |
        | stx *0x88,y   | 968800 |
        | stx *0x1234   | 8E3412 |
        | sty *0x32     | 843200 |
        | sty *0x88,x   | 948800 |
        | sty *0x1234   | 8C3412 |
        | tax           | AA0000 |
        | tay           | A80000 |
        | tsx           | BA0000 |
        | txa           | 8A0000 |
        | txs           | 9A0000 |
        | tya           | 980000 |

    Scenario: Label dereference
        When compiling the line "label: lda #>label"
        Then the compiled output should be "A98000"
    