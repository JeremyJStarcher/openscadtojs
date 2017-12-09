if (true) {
    echo("True block");
}
//%
if (true)
    echo("True block");
//%
if (false)
    echo("block1");
//%
if (false) {
    echo("block1");
}
//%
if (true) {
    echo("TRUE");
} else {
    echo("FALSE");
}
//%
if (false) {
    echo("TRUE");
} else {
    echo("FALSE");
}
//%
if (true)
    echo("TRUE");
 else 
    echo("FALSE");
//%
//%
if (true)
    if (true)
        echo("TRUE");
    else 
        echo("FALSE");
//%
if (false)
    if (true)
        echo("TRUE");
    else 
        echo("FALSE");
else
    echo("FALSE, I mean FALSE");
//%
if (true) {
    echo("TRUE1");
    echo("TRUE2");
} else {
    echo("FALSE1");
    echo("FALSE2");
}
//%
if (true) {
    b = 2;
    a = 1;
}
//%
var=1;
if (var) {
    echo("Checking a number");
}
//%
var=0;
if (var) {
    echo("Checking a number");
}
//%
var=[];
if (var) {
    echo("Checking a vector");
}
//%
var=[1];
if (var) {
    echo("Checking a vector");
}
//%
var=undef;
if (var) {
    echo("Checking a undefiend");
} else {
    echo("Was not defined");
}

