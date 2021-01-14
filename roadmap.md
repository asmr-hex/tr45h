# Feature Roadmap & Bug Fixes

## Audio
* normalize all sounds... to be the same DB

## Performance
* performance seems to be bad when second-pass parsing a lot...? maybe? idk

## Editor
* underline variables that are being played
* also somehow visualize which sequence is playing which variable steps
* underline even unavailable sounds? or just skip them?

## CLI
### Sounds
* `show`/`edit` sound
* `save` sound to collection (keybinding)
* `swap` sound (keybinding)
* `mute` sound
* `solo` sound
* `unmute` sound
* `unsolo` sound
* `list sounds`
### Settings
### Tutorial/UX
### Transport
### Projects
### Collections

## Interpreter
### Import Statements
### Assignment Statements
### Sequence Statements
### Garbage Collection
* ~~do not re-search a sound if someone begins typing a new sound without a space next to it. let some time pass before removing the first sound from the symbol table.~~
* ~~IMPORTANT AND DOABLE NOW do not re-search sounds if an error is introduced... collect all tokens within error and save as references in symbol table....~~

## Bugs
* repetition operator (lhs number) isn't working properly. sometimes sends into infinite loop. cpu === 100%
* pass AudioContext to processor functions
