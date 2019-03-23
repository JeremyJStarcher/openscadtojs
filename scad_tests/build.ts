const Bluebird = require('bluebird');
const fs = require('fs');
const path = require('path');
const exec = Bluebird.promisify(require('child_process').exec);
const os = require('os');
const readdir = Bluebird.promisify(require('fs').readdir);
const readFile = Bluebird.promisify(require('fs').readFile);
const writeFile = Bluebird.promisify(require('fs').writeFile);
const unlink = Bluebird.promisify(require('fs').unlink);
const tempy = require('tempy');

const sourceDir = './input';
const destDir = './output';
const CHUNK_SEPARATER = '//%';

const tempFileNames: string[] = [];

const isWindows = os.platform() === "win32";

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
};

function openScadDummyCode() {
    // OpenSCAD needs geometry before it will do anything useful, including
    // 'echo'.
    return 'cube(1);';
}

function runOpenScad(filename: string, displayName: string): Promise<ScadResult> {

    return new Promise<ScadResult>((resolve, reject) => {
        const result: ScadResult = {
            warnings: [],
            logs: [],
            source: '',
            fname: '',
        };

        readFile(filename, 'utf8').then((source: string) => {
            result.source = source;
        }).then(() => {

            exec(`openscad -o ${__dirname}/${destDir}/test.stl ${filename}`,
                function (error: Error, stdout: string, stderr: string) {
                    if (error) {
                        reject(error);
                        return;
                    }

                    result.fname = displayName;
                    result.logs = stdout.split(/\r\n|\r|\n/);
                    result.warnings = stderr.split(/\r\n|\r|\n/);

                    // The windows version seems to mixup the output
                    // so do special handling to split it.
                    if (isWindows) {
                        const slicePoint = 5;
                        result.warnings = result.logs.splice(slicePoint, result.logs.length);
                    }
                    resolve(result);
                });
        });
    });
}

async function buildJsTests() {
    const destFileName = `${destDir}/scad.ts`;
    const json: ScadResult[] = [];
    // const allFiles: string[] = await readdir(sourceDir);

    try {
        await unlink(destFileName);
    } catch (err) {
        if (err.code !== 'ENOENT') {
            throw err;
        }
    }

    const allFiles: string[] = walkSync(sourceDir);
    const scadFiles = allFiles.filter(fn => fn.endsWith('.scad'));
    scadFiles.sort();

    for (let i = 0; i < scadFiles.length; i++) {
        const sourceFile = scadFiles[i];

        console.log(`Processing file: ${sourceFile}`);

        const source = await readFile(sourceFile, 'utf8');

        const chunks = chunkify(source);

        for (let idx = 0; idx < chunks.length; idx++) {
            const chunk = chunks[idx];

            const tname = tempy.file({ extension: '.scad' });
            tempFileNames.push(tname);

            const scadCode = openScadDummyCode() + chunk;

            await writeFile(tname, scadCode, 'utf8');

            const res = await runOpenScad(tname, `${sourceFile}-${scadCode}`);
            json.push(res);
        }

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
    await writeFile(destFileName, ts, 'utf8');
}


function chunkify(source: string) {
    const chunks: string[] = [];
    let chunk: string[] = [];

    source.split(/\n|\r|\r\n/).forEach(line => {
        if (line.startsWith(CHUNK_SEPARATER)) {
            chunks.push(chunk.join('\n'));
            chunk = [];
        } else {
            chunk.push(line);
        }
    });
    chunks.push(chunk.join('\n'));

    return chunks;
}


buildJsTests().then(() => {
}).catch(err => {
    console.error('Runtime error: ' + err.message);
    process.exit(1);
}).then(() => {
    const promises: Promise<void>[] = [];

    tempFileNames.forEach(fname => {
        promises.push(unlink(fname));
    });

    return Promise.all(promises);
});

