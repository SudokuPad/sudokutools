# Sudoku Tools
Collection of sudoku tools

# Plans
- Collections and Lists
  - Sudoku editors/players/tools
  - Puzzle and data repositories
  - Scholarly articles
  - Youtube/Twitch channels
  - Discord servers
  - Twitch Accounts
- Compact sudoku storage formats
  - URL-friendly encodings (codoku/dedoku)
  - Compact mass storage
    - Sorted lists: "key-puzzles" and "delta-puzzles"
    - Unsorted, compare basic compression to minimal bit-patterns
- Format conversion
  - f-puzzles -> CtC
  - CtC -> f-puzzles
  - PenPa -> CtC
- Sudoku player format
  - Basic cosmetics
    - Custom primities: lines, circles, etc
    - Basic SVG: some subset of SVG, encoded generically (base64?)
    - Compressed SVG data
  - Universal SVG/PNG cosmetics
  - Well-defined constraints
  - Constraint primitives
  - Custom constraints (as DSL, or JS)
  - Meta data
- Sudoku solvers
  - Basic brute-force solver
  - More advanced or specific solvers
- Bookmarklets

# Documentation

## Data Primitives

### RC

Options:
- JSON: [1,1] -> [9,9] or as list: [[2.5,3.2],[3.2,3.5],[2.5,3.8]]
- Plain 9x9: R1C1 -> R9C9 (1x1 -> 9x9) or as list: R1C1R2C3R7C2
- Hex: R1C1 -> RfCf (1x1 -> 16x16)
- Higher base: R1C1 -> RZCZ (1x1 -> 35x35)
- Fractional RC: R2.5C3.2
- Fractional RC Hex: R2.fCb.c
- Fixed point Hex RC (imperial?!): R28Cff = R2.5C16.9375
- Spreadsheet: 1:1 -> 9:9