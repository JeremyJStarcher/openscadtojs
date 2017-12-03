echo([100:10:1000]);
echo([100:1000]);
//%

start = 1;
steps = 10;
end = steps * 100;
echo([start: steps: end]);
//%

// The three-part version is NOT DEPRECATED
echo([100 : 5 : 1]);

//%

/* This start > end is DEPRECATED, but make sure we handle it anyways. */
echo([100:1]);
