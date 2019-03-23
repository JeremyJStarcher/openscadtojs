# OpenSCAD to JS

## To run under Linux
* Install the Google Chrome browser.  (Used by tests.)
* Have `openscad` installed and in your path
  * If installing the appimage, create a symbolic link called `openscad` somewhere in your path.
* Clone the repo
* Build the grammar files: `npm run build:grammar`
* Build the OpenSCAD comparison tests: `npm run build:scadtest`
* Run the tests themselves: `npm test`
* OR -- Run the tests debuggable in the browser: `npm run testui`

## To run under Windows
* Install the Google Chrome browser.  (Used by tests.)
* Install `OpenSCAD` installed in its default directory
  * `c:\Program Files\OpenSCAD`
* Clone the repo
* Build the grammar files: `npm run build:grammar`
* Build the OpenSCAD comparison tests: `npm run build:scadtest-win`
* Run the tests themselves: `npm test`
* OR -- Run the tests debuggable in the browser: `npm run testui`

## History and purpose


This project strarted off as an OpenSCAD to JavaScript translator, but quickly became an OpenSCAD runtime environment written completely in JavaScript.

## Differences between OpenSCAD and other languages.
OpenSCAD works quite differently than most other languages and, as a result, requires a runtime process that is quite different.

The following code will explain the difference:

```
// Assign some geometry so the thing will run.
cube(1);


// Set our variable.

myvar = 10;

// In most languages, this would print '10'
echo(myvar);  // Prints 20.

// Not only are the variable declarations hoisted
// to the top of the scope, but the
// assignments themselves are hoisted as well.
myvar = 20;


// However, this behavior shows how hoisting
// works within a new scope.

if (true) {
    // Here, we get the value of '10'
    // because 'myvar' is picked up from 
    // the outside scope.
    localvar = myvar;
    
    // Now we shadow and create a new myvar.
    myvar = 99;
    
    localvar2 = myvar;
    
    echo(localvar);
    echo(localvar2);
}
```

And the result outut is:
*   ECHO: 20
*   ECHO: 20
*   ECHO: 99

In order to handle this, I am writing a multistep process

## Stage1 - Translate constants and build geometry (`stage2`) statements.

1) Tokenize and build an AST (Abstract Syntax Tree).  The AST itself becomes a set of instructions to execute.
2) Execute the AST.
    - Create and populate a global scope.
    - Evaluate constants. All values are constants.  (Really! outside of the weird case of having two assignments in one block where the last takes precedence, there is no reassignment.  There are no `++` or `+=` operators.)
    - When we encounter an assignment statement, execute it and store the value in the local scope.
    - If a module call is encountered, save that to our  `stage2` execution.
    - If a new scope is needed
        - Create a scope with a unique ID
        - Add a 'LoadScope' command to our `stage2` execution
        - Recurse into the new scope
        - Discard current scope and return the parent.
    - If a new `module` statement is encountered, add that module to our current scope. 


## `stage2`

The geometry now should be a flat list of 
* Load Context
* Execute geometry
* Drop current context

The goal is to run these geometry statements through `ThreeJS` to generate the graph.

