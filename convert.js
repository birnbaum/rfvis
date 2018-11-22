const createForest = require("./src/logic/parser");

/**
 * Produces a SVG file for each tree in the forest and stores them at the provided "out" folder
 */
async function runCli(folder) {
    const rawData = await readDataFolder(folder);
    const forest = createForest(rawData);
    console.log(forest)
}

runCli(process.argv[2]);