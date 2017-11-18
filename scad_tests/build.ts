const Bluebird = require('bluebird');
const fs = require('fs');
const path = require('path');
const exec = Bluebird.promisify(require('child_process').exec);
const readdir = Bluebird.promisify(require('fs').readdir);
const readFile = Bluebird.promisify(require('fs').readFile);
const writeFile = Bluebird.promisify(require('fs').writeFile);

const sourceDir = './input';
const destDir = './output';

interface ScadResult {
    warnings: string[];
    logs: string[];
    source: string;
    fname: string;
}


const walkSync = (dir: string, filelist: string[] = []) => {
    fs.readdirSync(dir).forEach((file: string) => {

        filelist = fs.statSync(path.join(dir, file)).isDirectory()
            ? walkSync(path.join(dir, file), filelist)
            : filelist.concat(path.join(dir, file));

    });
    return filelist;
}


function runOpenScad(filename: string): Promise<ScadResult> {

    return new Promise<ScadResult>((resolve, reject) => {
        const result: ScadResult = {
            warnings: [],
            logs: [],
            source: "",
            fname: "",
        };

        readFile(filename, 'utf8').then((source: string) => {
            result.source = source;
        }).then(() => {

            exec(`openscad -o test.stl ${filename}`,
                function (error: Error, stdout: string, stderr: string) {
                    if (error) {
                        reject(error);
                        return;
                    }

                    result.fname = filename;
                    result.logs = stdout.split(/\r\n|\r|\n/);
                    result.warnings = stderr.split(/\r\n|\r|\n/);
                    resolve(result);
                });
        });
    });
}

async function buildJsTests() {
    const json: ScadResult[] = [];
    // const allFiles: string[] = await readdir(sourceDir);

    const allFiles: string[] = walkSync(sourceDir);
    const scadFiles = allFiles.filter(fn => fn.endsWith('.scad'));
    scadFiles.sort();


    for (var i = 0; i < scadFiles.length; i++) {
        const fn = scadFiles[i];
        const res = await runOpenScad(fn);
        json.push(res);
        // console.log(res);
    }

    const ts = `
export interface ScadResult {
    warnings: string[];
    logs: string[];
    source: string;
    fname: string;
} 

export const scadTest: ScadResult[] = ${JSON.stringify(json, null, 4)};`;

    // console.log(`ts = `, ts);
    await writeFile(`${destDir}/scad.ts`, ts, 'utf8');
}

buildJsTests();