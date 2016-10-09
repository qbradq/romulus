# Romulus
Romulus is an opinionated assembler for the Nintendo Entertainment System.
Opinionated means this assembler does things its own way. Some conventions
of the past 40 years have been kept. However many features and syntax familiar
to 6502 hackers are changed or not present and many new features have
appeared.

Some in the NES dev community will ask, "Why build an assembler no one knows
how to use? That no one will support? That yada yada yada?" I know they will
because they asked the same questions the last time I wrote an assembler. The
simple answer is I am writting this assmebler to meet my own needs. The needs
of a man. A man in the year 20XX. The current year argument and all that.

With the creative writting out of the way, let's continue to the details.

# Lexical Conventions
The Romulus language syntax is based on a context-free grammar. This is in
sharp contrast to most assemblers which change lexical conventions based on
the current context. This is one source of the differences between Romulus and
typical assembler syntaxes.

## Line comment
A line comment start with two forward slashes and end at the end of the next
line.

  // This is a line comment

## Block comment
A block comment begin with a forward slash followed by an asterisk and end with
and asterisk followed by a forward slash. Block comments may be nested and
contain line breaks.

  /\* This is a block comment \*/
  /\* They can contain
   \* line breaks
   \*/
  /\* And /\* can \*/ be nested \*/

## Identifier
An identifier starts with a letter or underscore and may only contain letters,
digits, and underscores. Identifiers are case-sensitive.

## Keyword
A keyword is an identifier that is researved by the parser for use.

## Opcode
An opcode is a special keyword that corresponds to one of the 6502 machine
instructions.

## Number
Numbers come in many formats. All of the below examples are equal to 100
(decimal).

  0x64          // C-style hexadecimal
  $64           // Traditional hexadecimal
  100           // Decimal
  0144          // C-style octal
  0b01100100    // C-style binary
  %01100100     // Traditional binary

## String
Strings are double-quote delimited runs of printable characters and escape
sequences. An escape sequence is a backslash followed by a single character.

  "This is a string!\n"
  /\* Escape sequences
   \* \n    Newline, value 10
   \* \t    Tab, value 9
   \* \\    Litteral backslash
   \* \"    Litteral double quote
   \* \nnn  Where n is 0-7, outputs the byte represented by nnn base 8
   \* \xHH  Where H is 0-9a-fA-F, outputs the byte represented by HH base 16
   \*/

## Operator
An operator is a character that cannot appear in any other token and has a
special meaning in and of itself.

  ()[]{},+-\*/%&<>.:

# Syntax
The syntax of Romulus ressembles a mixture of C and assembly with no
semicolons.

## Conditional compilation
These keywords control how compilation of the source code progresses. These
functions are implemented as preprocessing macros in C and directives in
traditional assemblers.

### Include keyword
Reads in the named file and replaces the include statement with the contents
of the file. If the path given is relative (does not start with "/"), then the
path is resolved relative to the path of the file that contains the include
statement. If the path given is absolute (starts with "/"), then that path is
used. The once keyword can be included to ensure that the file is only ever
included once during this compilation session.

  include "lib/nes.asm"
  include once "lib/globals.asm" // Only included if not before

### Turn on a compilation flag
Defines a compilation flag as on. This is equivalent to the -f command-line
option.

  flag myFlag     // Turn on the myFlag compilation flag
  flag on myFlag  // Equivalent to the above

### Undefine a compilation flag
Defines a compilation flag as off. This is equivalent to the -F command-line
option.

  flag off myFlag // Turn off the myFlag compilation flag

### Inline conditional inclusion
An if-else construct that ommits the statement swithin the relavent block if
the controlling expression is false. Note that the else clause is always
optional. The endif keyword is required.

  if myFlag  // Include my stuff
    // My stuff
  else
    // Other stuff
  endif

  // Equivalent to the above
  if not myFlag
    // Other stuff
  else
    // My stuff
  endif

## Directives
Compiler directives give directions to the compiler to control code generation.
Directives are a common feature of traditional assemblers.

### Capabilities
Set a PCB capability. These describe the capabilities of the PCB which the
program targets. This does not nessecarily have to be a known PCB.
The attributes of the PCB can be described individually. However in-built
macros are provided for most of the known, popular PCBs used in North American
release titles. For a list of these macros see the end of this document or use
the command-line option --list-pcbs.

  capability mapper 0  // Mapper number (0-255)
  capability busconflict on // Mapper has bus conflicts
  capability prgrom 2  // Number of 16KB banks of PRG-ROM (1-256)
  capability chrrom 1  // Number of 8KB banks of CHR-ROM (0 for CHR-RAM) (0-256)
  capability mirroring horizontal // Horizontal mirroring
  capability mirroring vertical   // Vertical mirroring
  capability mirroring fourscreen // Four-screen mirroring with VRAM
  capability sram on   // Has SRAM (true or false)
  capability pal on    // Made for PAL systems (off=NTSC)
  //
  // Default values (Equivalent to NROM-128)
  //
  capability mapper 0
  capability busconflict off
  capability prgrom 1
  capability chrrom 1
  capability mirroring vertical
  capability sram off
  capability pal off

### Data location
Romulus always generates an iNES version 1 ROM image as output and fills all
all bytes that did not explicitly get data generated with zeros. This
simplifies the process of creating a correct ROM image. The data location
directives allow the programmer to easily place code and data into the desired
ROM bank.

All of these directives set the output pointer to a location in either the
program or character section of the ROM image. Note that the iNES header is
automatically generated.  

The "prgbank" directive sets the output location to the PRG ROM area at the
start of the indicated 16KB bank.

  prgbank 4  // Output starts 64KB into the PRG ROM area

The "prgofs" directive sets the PRG ROM area offset to an absolute value. If
using a mapper that uses 8KB PRG banks "prgofs" will need to be used to manage
code and data segments.

  prgofs 0x010000 // Fourth 16KB bank

The "chrbank" directive sets the output location to the CHR ROM area at the
start of the indicated 8KB bank.

  chrbank 2  // Output starts 16KB into the CHR ROM area

The "chrofs" directive sets the CHR ROM area offset to an absolute value. If
trying to use the compiler to manage the location and arrangement of character
data the "chrofs" directive will almost certainly need to be used.

  chrofs 0x004000 // Second 8KB bank

### Codepage
Starts a new codepage. A codepage is a segment of memory with a specific base
address and maximum length. The maximum length of a codepage is 0x8000, or two
program banks. A codepage is always padded to the maximum length with zeros
(brk instructions).

  codepage $C000, $4000  // NROM-128 codepage 
  codepage $8000, $8000  // NROM-256 codepage
  codepage $A000, $2000  // MMC3 8KB PRG segment

TODO - Write feature tests

## Labels
Labels identify addresses within CPU address space. Every time a label is
referenced it is interpreted as an address rather than a litteral number
unless it is preceeded by the address litteral opperator (#). Labels are
defined in a number of ways and for a number of reasons.

### Variables
A variable definition allocates a portion of RAM for use by the program.
Some optional modifier keywords are available to control what segment of
memory the variable is allocated to. The "fast" keyword forces the variable
into page zero. The "static" keyword forces the variable into SRAM (pages
$60 through $7F). If no modifier is specified the variable is first fit into
pages $03 through $07. If this fails and the SRAM is available the variable
is fit there. If all fitting attempts fail a compilation error will occur.
Variables will only be put into zero page when specified with the "fast"
keyword.

Finally there are several keywords that can be used to define a variable.
They all determine the number of bytes allocated for that particular variable.
The "byte" keyword allocates one byte, "word" allocates two, "triplet" three,
and "dword" four. Furthermore an array can be created using bracket syntax.

  // Zero-page variables
  fast byte frame
  fast dword timer
  fast word ptr
  fast byte temp
  fast byte[36] ppuCommandBuffer
  fast word[2] commandPointers

  // Other variables (will go into either work RAM above $02FF or SRAM)
  triplet score
  byte[256] songBuffer

  // Our save data, forced into SRAM
  static triplet[10] highScores

When referencing a variable label that refers to more than one byte there are
some automatically generated sub-labels that allow referencing the individual
bytes. They are "a" through "d" corresponding to the four bytes, where "a"
is the least-significat byte and "d" the most-significat. If no sub-label is
given the least-significat byte is addressed.

  // Dereferencing the bytes of a long variable
  dword timer

  lda timer.c     // References the third byte of timer.

Arrays are arranged stripped in memory. This means that for an array of words
the least-significat bytes are allocated to a single array (arrayName.a) and
the most-significat bytes are allocated to another array (arrayName.b). It is
important to note that these byte arrays may not be arranged in order, or
even be near each other in CPU address space. If a non-stripped array is
required use a single large byte array and address it manually. 

### Code labels
A code label uniquely identifies a position within CPU address space relative
to generated code. To define a label simply follow an identifier with a colon.
Code labels are identical to variable labels except that they refer to ROM
addresses.

  myFunction:
    lda 7
    sta somewhere
    ldx 16
    loop:
      lda data,x
      sta buffer,x
      dex
      bne loop
    rts

### Scope labels
The scope keyword introduces a named lexical scope for the labels found within.
The named lexical scope lasts until the terminating brace. The scope keyword
itself defines a label of the same name. Labels within the scope may be
referenced directly by code within the scope. From outside the scope the dotted
scope label form must be used.

  // The scope keyword can be used as handy function enclosures
  scope myFunc {
    fast byte counter
    lda 0
    sta counter
    loop:
      dec counter
      bne loop
    rts
  }
  jsr myFunc
  lda myFunc.counter

## Data generation
Raw data must often be defined directly within source code. The following
keywords accomplish this.

### Out keyword
The out keyword outputs one data element without a label. The same size
keywords that apply to variables apply to out statements as well however the
allocation keywords do not. Note that within an out statement label names are
always dereferenced.

  // Output some random byte
  out byte $ff

### Ascii keyword
The ascii keyword outputs a string of bytes in ASCII format with an optional
offset. If given, the offset is applied to every byte in the string.

  // Output an ASCII string and adjust it for a CHR ROM that starts with the
  // printable ASCII characters.
  ascii "Hello World!", -32
  // Output an unmodified ASCII string
  ascii "Stuff and Junk"

### Table keyword
The table keyword outputs stripped arrays of bytes to the ROM. Unline variable
arrays the successive byte fields of a table are guaranteed to be in order
and contingious. The same size keywords that apply to variables apply to
tables as well however the allocation keywords do not. The elements of a table
are seperated by commas. Note that within a table statement label names are
always dereferenced.

  // Pointer table
  table word levelPointers
    level1, level2, level3, 0x0000
  // Access the table
  lda levelPointer.a,x
  sta ptr
  lda levelPointer.b,x
  sta ptr+1

## Code generation
What would a compiler be without the ability to generate machine code? All
statements that start with an opcode will generate one machine instruction
along with the nessecary parameters. There are thirteen different addressing
modes supported by the 6502 processor. Romulus compresses these into eight
different syntaxes.  

### Implied operation
In implied mode no parameters are required after the opcode. This applies to
instructions that use the Implicit and Accumulator addressing modes.

  sei
  tax
  dex
  pha

### Immediate value
Immediate value mode is used anytime a numeric litteral is found after the
opcode. The compiler selects Immediate addressing mode for the instruction.

  // Loads the number zero into the Accumulator
  lda 0

Note that if a label's value is required to be used as an immediate value
the label dereference operator (and typically a byte selection operator) must
be used.

  // Store a function pointer
  lda #<myFunc
  sta ptr.a
  lda #>myFunc
  sta ptr.b

### Address
Address mode is used anytime a label is found after the opcode. The compiler
selects between ZeroPage, Absolute, and Relative addressing as appropriote
based on the opcode and the label.

  lda myTempVariable
  beq someLabel
  jsr frameSkip

Note that if a numeric address litteral is required the address reference
opperator must be used.

  jsr *$8000

### Address,X
This mode is used anytime a label is found after the opcode followed by a comma
and a lower-case x. Like the Address mode, this selects between ZeroPage,X and
Absolute,X based on the opcode and label referenced.

  lda buffer,x
  sta *0x6000,x

### Address,Y
This mode is used anytime a label is found after the opcode followed by a comma
and a lower-case y. Like the Address mode, this selects between ZeroPage,Y and
Absolute,Y based on the opcode and label referenced.

  lda songData,y
  sta *0x0300,y

### Indirect
Indirect mode translates directly to the Indirect addressing mode of the 6502.
It is used when a label is found to the left of the opcode surrounded by
parenthesis.

  jmp (frameHandler)
  jmp (*0xFFFC)

### Indexed Indirect
Indexed indirect mode translates directly to the Indexed Indirect addressing
mode of the 6502. It is used when a label, comma and lower-case x is found to
the left of the opcode surrounded by parenthesis. Note that the label
referenced must be a zeropage label.

  lda (streamPointers,x)
  sta (*0xFE)

### Indirect Indexed
Indirect indexed mode translates directly to the Indirect Indexed addressing
mode of the 6502. It is used when a label is found to the left of the opcode
surrounded by parenthesis followed by a comma and a lower-case y. Note that
the label referenced must be a zeropage label.

  lda (bufptr),y
  sta (*0x2006)

## Numerical constants
Romulus supports limited mathmatical operations on numeric litterals and
labels. Only addition, subtraction, and negation (negative numbers) are
supported. Evaluation is done from left to right. All calculations are done
with 32-bit percision and then truncated to an unsigned 16-bit value. The
value may further be truncated to an 8-bit unsigned value depending on the
context.

  lda levelPtrTable.a + 4 - 2 + 1 

## Macros
Macros allow the programmer to define an identifier that is replaced with a
series of tokens any time it is encountered. This is useful for everything
from assigning a meaningful name to a magic number or address to generating
code.

  // Macro for standard NES memory register
  define OAMDMA { *$4014 }

Note that macros are not bound by lexical scope.

# Order of Compilation
Compilation occurs in this order:
 1. include statements are processed recursively until none are left
 2. if and flag statements are processed recursively until none are left
 3. Macros are expanded recursively
 4. capability statements are executed
 5. Labels are scanned in a single pass
 6. Labels are resolved in a single pass
 7. Code is generated

# Built-In PCB Macros
As described under the capability keyword the compiler defaults to generating
an image suitable for the NES-NROM-128 PCB and clones. In order to target the
compiler to a different PCB individual capability statements can be used to
describe the capabilities of the target board. These macros do just that for
the development boards currently available. These macros are defined in the
file src/pcb.asm.

Note that the macro names align with the products on
http://www.infiniteneslives.com/nessupplies.php , not nessecarily their
production counterparts. For instance, SEROM offers 128K of CHR ROM which is
compatible with a number of Nintendo PCBs offering 32K of PRG ROM and expanded
CHR ROM.

  Macro    Mapper PRG  CHR  SRAM Battery?
  NROM     None   32K  8K   None N/A
  SEROM    MMC1   32K  128K None N/A
  SIROM    MMC1   32K  128K 8K   Yes
  SLROM    MMC1   256K 128K None N/A
  SJROM    MMC1   256K 128K 8K   No
  SKROM    MMC1   256K 256K 8K   Yes
  SGROM    MMC1   256K RAM  None N/A
  SNROM    MMC1   256K RAM  8K   Yes
  SUROM    MMC1   512K RAM  8K   Yes
  UNROM    UxROM  128K RAM  None N/A
  CNROM    CxROM  32K  128K None N/A
  TLROM    MMC3   512K 256K None N/A
  TSROM    MMC3   512K 256K 8K   No
  TKROM    MMC3   512K 256K 8K   Yes
  TGROM    MMC3   512K RAM  None No
  TNROM    MMC3   512K RAM  8K   Yes
  PNROM    MMC2   256K 128K None N/A
  PKROM    MMC2   256K 128K 8K   Yes
  FKROM    MMC4   256K 128K 8K   Yes

Note that all macros define vertical mirroring (horizontal arrangement). If
a mapper is in use that does not control mirroring such as NROM and horizontal
mirroring is desired use the appropriote capability statement. This statement
may come before or after the macro as the macros never explicitly set
mirroring. The same can be said for PAL support. PAL support is disabled by
default. If required turn it on explicitly.
