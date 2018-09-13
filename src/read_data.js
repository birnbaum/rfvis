import * as fs from "fs";
import * as path from "path";
import * as util from "util";

export {readDataFolder};


/**
 * Reads the text files from the provided data folder
 * @param {string} dataFolder - Folder containing the forest data text files
 * @returns {Promise<{forestFileContent: string, treeFileContents: [string]}>}
 */
function readDataFolder(dataFolder) {
    const fs_readFile = util.promisify(fs.readFile);

    const dataPath = path.resolve(dataFolder);
    const forestFile = path.join(dataPath, "forest.txt");
    const forestFileContent = fs.readFileSync(forestFile, "utf8");

    const treeFileContentPromises = {};
    for (const file of fs.readdirSync(dataPath)) {
        if (file.startsWith("tree") && file.endsWith(".txt")) {
            const id = Number.parseInt(file.split(".")[0].split("_")[1]);
            treeFileContentPromises[id] = fs_readFile(path.join(dataPath, file), "utf8");
        }
    }
    return Promise.all(Object.values(treeFileContentPromises))
        .then(treeFileContents => ({forestFileContent, treeFileContents}));
}