
/**
 * when designing these classes, think of the following language strings
 *
 * (1) simple 3 step sequence with no groupings, sub-beats, or choices
 *   apple orange pear
 *
 * (2) 2 step sequence with one choice of 2 options (note the choice operator is left-associative)
 *   apple | orange pear == (apple | orange) pear
 *
 * (3) 1 step sequence with one choice of 3 options
 *   apple | orange | pear
 *
 * (4) 3 step sequence with one sub-beat expression (with ppqn0 = 1, ppqn1 = ppqn0 * 2 in sub-beat expr)
 *   [ apple orange ] pear
 * 
 * (5) 7 step sequence with two sub-beat expressions nested (ppqn0 = 1, ppqn1= ppqn0 * 2, ppqn2 = ppqn1 * 5)
 *   [ apple [ orange pear kiwi lime lemon ] ] banana
 *
 * (6) 2 or 4 step sequence. choice either chooses a single step or a sub-beat expr consisting of 3 steps
 *   apple | [ apple orange pear ] banana
 *
 * (7) 2 or 3 step sequence. a choice is embedded within another choice (inside a beat expr)
 *   apple | [ apple | orange pear ] banana
 *
 * (8) 2 or 3 or 5 step sequence. a choice in a choice where an option is another sub-beat expr
 *   apple | [ apple | [ apple orange pear ] kiwi ] banana
 *
 * (9) 2 or 4 step sequence. a choice is a sub-sequence grouping.
 *   apple | ( apple orange pear) banana
 *
 * NOTE: from a choice's perspective, parenthetical groupings and sub-beat exprs are similar
 *       in that they allow a choice option to be a sub-sequence. the functional difference is
 *       that a sub-beat expr modifies the ppqn of its steps
 */

// how do we want to use these data structures?
// we want to basically have a toplevel sequence for each evaluated line in our code
// so at the top level, the scheduler will be working we sequence objects and performing the following operations on them
// (1) advanceToNextStep()
// (2) get information about the next resolved step (sound name, fx (eventually), ppqn)
// (3) keep track of current step also so we can check the ppqn (we will need this for determining when to schedule the next step, since the currnt.ppqn is what determines the next scheduled time)
// (4) eventually, we need to figure out how to do updates....
// so from the scheduler's perspective...it is all deterministic!

