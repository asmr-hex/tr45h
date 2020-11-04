
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
