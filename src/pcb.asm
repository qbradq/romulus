/* pcb.asm
 * 
 * Defines all built-in macros for defining PCB capabilities.
 */

define NROM {
    capability prgrom 2
    capability busconflict yes
}

define SEROM {
    capability mapper 1
    capability prgrom 2
    capability chrrom 16
    capability sram false
}

define SIROM {
    capability mapper 1
    capability prgrom 2
    capability chrrom 16
    capability sram true
}

define SLROM {
    capability mapper 1
    capability prgrom 16
    capability chrrom 16
    capability sram false
}

define SJROM {
    capability mapper 1
    capability prgrom 16
    capability chrrom 16
    capability sram true
}

define SKROM {
    capability mapper 1
    capability prgrom 16
    capability chrrom 32
    capability sram yes
}

define SGROM {
    capability mapper 1
    capability prgrom 16
    capability chrrom 0
    capability sram false
}

define SNROM {
    capability mapper 1
    capability prgrom 16
    capability chrrom 0
    capability sram true
}

define SUROM {
    capability mapper 1
    capability prgrom 32
    capability chrrom 0
    capability sram true
}

define UNROM {
    capability mapper 2
    capability prgrom 8
    capability chrrom 0
    capability sram false
    capability busconflict yes
}

define CNROM {
    capability mapper 3
    capability prgrom 2
    capability chrrom 16
    capability sram false
    capability busconflict yes
}

define TLROM {
    capability mapper 4
    capability prgrom 32
    capability chrrom 32
    capability sram false
}

define TSROM {
    capability mapper 4
    capability prgrom 32
    capability chrrom 32
    capability sram true
}

define TKROM {
    capability mapper 4
    capability prgrom 32
    capability chrrom 32
    capability sram true
}

define TGROM {
    capability mapper 4
    capability prgrom 32
    capability chrrom 0
    capability sram false
}

define TNROM {
    capability mapper 4
    capability prgrom 32
    capability chrrom 0
    capability sram true
}

define PNROM {
    capability mapper 9
    capability prgrom 16
    capability chrrom 16
    capability sram false
}

define PKROM {
    capability mapper 9
    capability prgrom 16
    capability chrrom 16
    capability sram true
}

define FKROM {
    capability mapper 10
    capability prgrom 16
    capability chrrom 16
    capability sram true
}
