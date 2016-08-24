'use strict';
const readline = require('readline');
const fs = require('fs');


/**
 * Create readline interface for file
 * @param pathToFile
 */
function createReadLiner(pathToFile) {
    return readline.createInterface({
        input: fs.createReadStream(pathToFile)
    });
}


/**
 * Get file data from array of path
 * Return Promise which resolve with array of objects {path, data}
 * @param pathToFile
 * @returns {Promise}
 */
function getFileData(pathToFile) {

    return new Promise((resolve, reject) => {

        let fileData = [];

        const readLiner = createReadLiner(pathToFile);

        readLiner.on('line', (line) => {
            fileData.push(line);
        });

        readLiner.on('close', () => {
            resolve({
                path: pathToFile,
                data: fileData
            })
        });

        readLiner.on('error', (err) => {
            reject(err)
        });

    })

}

/**
 * Compare two file's data and output diff into console
 * @param originalFile
 * @param modifiedFile
 */
function buildDiff(originalFile, modifiedFile) {

    let removed = {};
    let added = {};
    let same = {};
    let result = [];

    /**
     * Get lines which removed and still the same
     */
    originalFile.data.map((line, i) => {
        if (modifiedFile.data.indexOf(line) == -1) {
            removed[i + 1] = line;
        } else {
            same[i + 1] = line;
        }
    });

    /**
     * Get lines which were added
     */
    modifiedFile.data.map((line, i) => {
        if (originalFile.data.indexOf(line) == -1) {
            added[i + 1] = line;
        }
    });


    /**
     * Find length of diff
     */
    let addedKeys = Object.keys(added);
    let removedKeys = Object.keys(removed);
    let sameKeys = Object.keys(same);

    let arrayOfChanges = addedKeys
        .concat(removedKeys)
        .concat(sameKeys);
    
    let diffLength = arrayOfChanges.length;


    /**
     * Calculate the diff
     */
    for (let i = 1; i <= diffLength; i++) {
        if (removed[i] && added[i]) {
            result.push(` * ${removed[i]}|${added[i]}`)
        } else if (removed[i]) {
            if (same[i]) {
                result.push(`   ${same[i]}`);
                result.push(` - ${removed[i]}`);
            } else {
                result.push(` - ${removed[i]}`)
            }

        } else if (added[i]) {

            if (same[i]) {
                result.push(`   ${same[i]}`);
                result.push(` + ${added[i]}`);
            } else {
                result.push(` + ${added[i]}`)
            }
        } else if (same[i]) {
            result.push(`   ${same[i]}`);
        }
    }


    console.log(`\nDiff between \n${originalFile.path} and \n${modifiedFile.path}`);

    result.map((line, i) => {
        console.log(`${i + 1} ${line}`)
    })

}

/**
 * 
 * @param filesData
 * @returns {Promise.<T>}
 */
function runBuildDiff(filesData) {

    let originalFileData = filesData[0];

    let filesToCompare = filesData.slice(1);

    filesToCompare.map(file => buildDiff(originalFileData, file));

    return Promise.resolve();

}


/**
 * Function get array of path and build diff for all files in array
 * All files compare with first file
 * Promise interface using for consistent
 * @param filesToCompare
 * @returns {*}
 */
function diff(filesToCompare) {

    let existedFiles = filesToCompare.filter(file => fs.existsSync(file));

    if (existedFiles.length < 2) {
        return Promise.reject( new Error(`You need at least two files to compare. Got ${existedFiles.length}`))
    }

    let getFilesDataAsync = existedFiles.map(file => getFileData(file));

    return Promise.all(getFilesDataAsync)
        .then(runBuildDiff)

}


module.exports = diff;