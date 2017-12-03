echo(1 > 1);
//%

echo(1 > 2);
//%
echo(1 > "1");
//%
echo(1 > "2");
//%
echo("1" > 1);
//%
echo("1" > 2);
//%
echo("12" > "12");
//%
echo("a" > "b");
//%
echo("b" > "a");
//%

echo(1 > true);
//%
echo(0 > true);
//%
echo("a" > true);
//%

echo(true > 0);
//%
echo(false > 0);
//%
echo(true > 1);
//%
echo(false > 1);
//%
echo(true > 2);
//%
echo(false > 2);
//%

echo(0 > true);
//%
echo(0 > false);
//%
echo(1 > true);
//%
echo(1 > false);
//%
echo(2 > true);
//%
echo(2 > false);
//%

echo(true > "a");
//%

echo(true > true);
//%
echo(true > false);
//%
echo(false > true);
//%

echo([1] > [1]);
//%
echo([1,2] > [1,2]);
//%
echo([1,[2,3]] > [1,[2,3]]);
//%
echo([1] > [2]);
//%
echo([1,[2,3]] > [1,[2,4]]);
//%


echo(1 > [1]);
//%
echo(true > [1]);
//%
echo("1" > [1]);
//%

echo([1] > 1);
//%
echo([1] > true);
//%
echo([1] > "1");
//%

echo(1+4 > 5);

