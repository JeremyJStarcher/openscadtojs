const Promise = require('bluebird');
const exec = Promise.promisify(require('child_process').exec);



child = exec("openscad -o test.stl ./input/hello_world.scad",
    function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
            console.log('exec error: ' + error);
        }
    });
