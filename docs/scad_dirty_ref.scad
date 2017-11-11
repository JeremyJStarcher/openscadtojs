cube(1);

maxValue = max([1, 6]);
max([1,6]);

module echo() {
}

echo("maxValue = ");
echo(maxValue);


echo("Hi" / "World");
echo("Hi" * "World");





echo(1 + 1);
echo("Hi" + "World");

echo("1" + 4);



// k+"Hello";


// (1+1)


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


a1 = 100;
b1 = 50;

if (true) {
    a2 = 100 + b1;
    b1 = a2;
    echo("innertrue test");
    echo(a2);
    echo(b1);
}

module testNameCollision() {
}

echo("testNameCollision collides?");
echo(testNameCollision);

// Unary operator spacing
unaryTest1 = !! true;
unaryTest2 = + true;
unaryTest3 = - true;

echo(str("unaryTest1 = ", unaryTest1));
echo(str("unaryTest2 = ", unaryTest2));
echo(str("unaryTest2 = ", unaryTest2));
