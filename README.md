# romulus
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

## Design Philosophy
The assembler and its syntax follow a design philosophy informed by many years
of 6502 development in many different assemblers and high level languages for
a variety of platforms released in North America. Additionally my work in the
software industry has helped shape my opinions of this delightful platform and
the needs of a modern day developer targeting it.

The mantra of Romulus is "maintainability". In my experiance I have found
Maintainability breaks down into many topics. Compliance: can I prove that it
complies with the contracts given to the user? Testability: can I prove it
that it works as intended after changes, and that a new feature does not work
before implementation? Readability: can I easily read the software and its
documentation? Performance: can I provide a meaningful measure of performance
in a format that is compariable between itterations?

The design philosophy of Romulus applies not only to the assembler syntax and
its features but to the assembler itself. Romulus achieves compliance using
Behavioral Driven Development. Cucumber-JS is used for testing. A straight-
forward coding style is used to help ensure readability. And an in-built suite
of performance tests provide repeatable performance metrics.

The assembler syntax of Romulus cannot help achieve compliance. This is a
behavioral discipline that the developer must achieve for themselves. However
Romulus provides a simulation and integration layer to provide true testing
ability for NES developers. This in turn helps enables compliance. Most of the
syntax and feature changes over more traditional assemblers are to enhance the
readability of code. The simulation and integration features include
performance measurement and reporting. Finally the assembler has various
utilities to micro-manage performance when timed code execution matters.

# Syntax
The syntax of Romulus resembles C with inline assembly.

## 