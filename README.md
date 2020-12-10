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
that = (a bound sequence of sound-phrases)

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
apple(A#, 400hz) # its almost as if you are calling a sound-phrase as a function.

# random choice (OR)
apple | orange                         # each sound-phrase gets a quarter note, but are randomnly chosen with probability 0.5
apple |(0.4) orange                  # apple has p=0.6 and orange has p=0.4
apple | orange || pear                 # apple, orange & pear have p=0.33
apple |(0.2) orange |(0.4) pear   # orange p=0.2, pear p=0.4, apple p=0.4 (takes the remaining)
apple |(0.9) orange | pear         # orange p=0.9, pear and apple p=0.5 (split the remaining)

apple | orange pear                    # OR only applies to apple & orange, pear is not random
apple | (orange | pear)               # apple and (orange || pear) p=0.5, orange and pear p=0.5 locally within grouping, but globally each p=0.25
apple |(0.9) (orange |(0.7) pear) # apple p=0.1, orange p_local=0.3 p=0.27; pear p_local=0.7 p=0.63
# note: any grouping must have their probabilities sum to 1
# random choice can be applied to sequences too!

# processing operators
# you can define a processor chain with '.'

apple.volume(a=5,d=3,s=5,r=6).reverse.delay(500).reverb(500).pan(30, 70)

# you can save process chains into variables also
chain1 = volume(10).reverse.delay(8)
# and use them later
apple.chain1


some examples

(one [two (three four [five six])])
lets call [...] a beatexpr
a beatexpr can have a sequence inside
```

## editor components
### interpreter
* lexing
* parsing
* evaluation


## BNF
/**
 * SOUND_LITERAL has a buffer and an optional process chain
 * VARIABLE can be bound to an EXPRESSION
 * EXPRESSION can be a
 */

// statement:
//  * variable assignment
//  * sequence
//
// variable assignment LHS:
//  * fxchain
//  * sequence
//  * function (lfo)
//
//

// how to left-factor lists....
// https://stackoverflow.com/questions/33987688/looking-for-advice-on-making-this-bnf-grammar-suitable-for-ll1-parsing-left-f
// interesting!

// small start: only support parentheses and beatexpr
// (right now paranthesis do nothing...)
/**
 * <program> := <statements>
 *
 * <statements> := <statement> \n
 *               | <statement> \n <statements>
 *
 * <statement> := <sequence>
 *
 * <sequence> := <sound>
 *             | <sound> <sequence>
 *             | <beatexpr>
 *             | ( <sequence> )
 *
 * <beatexpr> := [ <sequence> ]
 *
 * <sound> := <soundvar>
 *          | " <soundvars> "
 *
 * <soundvars> := <soundvar>
 *              | <soundvar> <soundvars>
 *
 * <soundvar> := <identifier>
 *
 */

// stan has a good reference https://mc-stan.org/docs/2_22/reference-manual/bnf-grammars.html
/**
 * BNF Notation
 *
 * <program> := <statement>
 *            | <statement> <program>
 *
 * <statement> := <identifier> = <expression>
 *              | <expression>
 *
 * <expression> := <sequence>
 *               | <fxchain>
 *
 * <sequence> := <sound>
 *             | <sound> <sequence>
 *             | <beatexpr>
 *             | ( <sequence> )
 *             | <sequence> <or> <sequence>
 *
 * <beatexpr> := [ <sequence> ]
 *
 * <sound> := <identifier>
 *          | <sound> . <fxchain>
 *          | ( <sound> )
 *
 * <fxchain> := <fx>
 *            | <fx> . <fxchain>
 *
 * <fx> := <identifier>
 *       | <identifier> ( <args> )
 *
 * <args> := <num>
 *         | <num> , <args>
 *
 * <or> := '|'
 *       | '|' ( ?<num> )
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 * <expression> :=
 *
 * <sequence> := <soundExpression>
 *             | <soundExpression> <sequence>
 *
 * <soundExpression> := <sound>
 *                    | <sound> . <processorExpression>
 *
 * <processorExpression> := <processor>
 *                        | <processor> . <processorExpression>
 *
 * <soundLiteral> :=
 *
 * <orExpression> := <soundExpression> <orOperator> <soundExpression>
 *                 |
 *
 * <orOperator> := '|'
 *               | '|' ( <number> )
 *
 * <variableDecl> := <variable> <assignementOperator> <expression>
 *
 * <variable> := <identifier>
 *
 * <identifier> := [a-zA-Z]+ [a-zA-Z0-9_]*
 *
 * <assignmentOperator> := =
 *
 * <number> ::= <int>
 *            | <int> . <int>
 *
 * <int> := [0-9]+
 */
