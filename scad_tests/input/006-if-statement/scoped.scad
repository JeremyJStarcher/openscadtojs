echo(t);
t="outer";
echo(t);
if (true) {
    t="inner";
    echo(t);
} else {
    echo("FALSE");
}
//%
a=10;
if(true) {
    a = 20;
    echo(a);
}
echo(a);
//%
a=10;
if(true) {
    b = a;
    a = 1701;
    echo(a);
    echo(b);
}
echo(a);
echo(b);