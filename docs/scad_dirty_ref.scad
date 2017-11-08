a = 10;
b = 20;

a = 100 + b;
b = 100 +a;


//* Generates an error
// undef = 200;

module a() {
    //* Generates an error, even in its own scope.
    // undef = 500;
}



echo(PI*10000);
echo(b);
echo(undef);
