// import * as moo from 'moo'
/*
Why is parser.results an array? 
Sometimes, a grammar can parse a particular string in multiple different ways.
For example, the following grammar parses the string "xyz" in two different ways.

x -> "xy" "z"
   | "x" "yz"

Such grammars are ambiguous. nearley provides you with all the parsings.
In most cases, however, your grammars should not be ambiguous
(parsing ambiguous grammars is inefficient!).
Thus, the most common usage is to simply query parser.results[0].

You might like to check first that parser.results.length is exactly 1;
 if there is more than one result, then your grammar is ambiguous!
*/

