const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();

if(process.argv.length !== 3) {
    throw 'Usage: node server.js <data_folder>';
}

const statisticsDir = process.argv[2] + '/statistics';
const summaryFile = process.argv[2] + '/summary.txt';

app.get('/',     (req, res) => res.sendFile(path.join(__dirname + '/index.html')));
app.get('/data', (req, res) => res.json(createForest(summaryFile, statisticsDir)));
app.use(express.static('public'));

app.listen(3000, () => console.log('Example app listening on port 3000!'));


/**
 * Reads the provided txt files and construcs a forest object of the following form:
 *  {
 *      strength: float,
 *      correlationMatrix: [[float]],
 *      trees: [{
 *          strength: float,
 *          nodes: [
 *              [int, int, int, int, int]  // correspond to height, samples, impurity, impurityDrop, feature
 *          ]
 *      }]
 *  }
 *
 * @param {string} summaryFile - Path to the overall summary file
 * @param {string} statisticsDirectory - Path to the directory containing the tree statistics files
 * @returns {Object}
 */
function createForest(summaryFile, statisticsDirectory) {
    const summary = fs.readFileSync(summaryFile, 'utf-8');
    const summaryParts = summary.split('\n\n');

    const totalStrength = Number.parseFloat(summaryParts[0]);
    const correlationMatrix = parseCorrelationMatrix(summaryParts[2]);

    const treeFiles = fs.readdirSync(statisticsDirectory);
    const treeStrengths = summaryParts[1].split('\n').map(Number.parseFloat);

    // Sanity check
    if (treeFiles.length !== treeStrengths.length) {
        console.log(treeFiles, treeStrengths);
        console.log(treeFiles.length, treeStrengths.length);
        throw `Number of trees noted in ${summaryFile} (${treeFiles.length}) is inconsistend ` +
        `to the amount of files in ${statisticsDirectory} (${treeStrengths.length})`;
    }

    const trees = treeFiles.map((treeFile, index) => {
        const treeFilePath = path.resolve(statisticsDirectory, treeFile);
        const content = fs.readFileSync(treeFilePath, 'utf-8');
        return {
            strength: treeStrengths[index],
            nodes: parseStatisticsContent(content)
        }
    });

    return {
        strength: totalStrength,
        correlationMatrix: correlationMatrix,
        trees: trees
    }
}

/**
 * Parses a given correlation matrix text to a two-dimensional array of floats
 * @param {string} text - correlation matrix text
 * @returns {number[][]}
 */
function parseCorrelationMatrix(text) {
    text = text.replace(/\[|\]/g, '');  // Remove [] brackets from string
    return text.split(';\n').map(line =>
        line.split(',').map(Number.parseFloat)
    );
}

/**
 * Parses a given tree statistics text file content into an internal tuple representation
 * @param {string} text - tree statistics text
 * @returns {number[][]}
 */
function parseStatisticsContent(text) {
    return text.trim().split('\n').map(line => {
        const fields = line.split(';');
        return [
            Number.parseInt(fields[0]),  // height
            Number.parseInt(fields[1]),  // samples
            Number.parseFloat(fields[2]),  // impurity
            Number.parseFloat(fields[9]),  // impurityDrop
            Number.parseInt(fields[3]),  // feature
        ]
    });
}