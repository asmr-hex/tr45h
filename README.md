# tr4shy

## syntax

```
# comment

# writing sound-phrases without additional syntax
this, should work even with punctuation!

# permitted punctuation in sound-phrases (. , ? ! - _)

# you can assign a sound-phrase or group or sound-phrases (a sequence) to a variable
# if you type an equal sign after a sound-phrase. e.g.,
# note: the bound sounds will be downloaded after binding, but won't be played until the variable name is evaluated
# also note: the constituent sounds bound to a variable will be available to use on their own outside of the variable binding
this = "my bound sound-phrase"
that = {a bound sequence of sound-phrases}

# this brings us to groupings
# parenthesis define logical groupings of sound phrases
# note: if you start typing a phrase-grouping it won't start downloading the sounds until you are done?
(this is a logical grouped sequence of sound-phrases)

# --- subdivisions ---
# any sound-phrase or sequence of sound-phrases can be evenly subdivided to fit into one slot of the current subdivision
# for example
one two three four # each sound-phrase gets one quarter-note pulse
[one] two three four # this is the same as above
[one two] three four # "one" and "two" are divided to fit into one quarter-note pulse (thus they are 8th notes)
[one two three] four # "one" "two" "three" are triplets fitting into one quarter-note pulse
[[one two] three] four # "one" "two" fit into one 8th note pulse, "three" fits into one 8th note pulse "four" is a quarter note

# rest
~ ~ ~ ~ # four rests

# --- operators ---

# ensure features
# this operator ensures that sound-phrases or sequences of sound phrases satisfy the provided sonic features
apple{}

# random choice (OR)
apple || orange                         # each sound-phrase gets a quarter note, but are randomnly chosen with probability 0.5
apple ||(0.4) orange                  # apple has p=0.6 and orange has p=0.4
apple || orange || pear                 # apple, orange & pear have p=0.33
apple ||(0.2) orange ||(0.4) pear   # orange p=0.2, pear p=0.4, apple p=0.4 (takes the remaining)
apple ||(0.9) orange || pear         # orange p=0.9, pear and apple p=0.5 (split the remaining)

apple || orange pear                    # OR only applies to apple & orange, pear is not random
apple || (orange || pear)               # apple and (orange || pear) p=0.5, orange and pear p=0.5 locally within grouping, but globally each p=0.25
apple ||(0.9) (orange ||(0.7) pear) # apple p=0.1, orange p_local=0.3 p=0.27; pear p_local=0.7 p=0.63
# note: any grouping must have their probabilities sum to 1
# random choice can be applied to sequences too!

# processing operators
# you can define a processor chain with '.'

apple.volume(a:5,d:3,s:5,r:6).reverse.delay(500).reverb(500).pan(30, 70)

```

## editor components
### interpreter
* lexing
* parsing
* evaluation
