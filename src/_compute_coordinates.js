/**
 * This script contains the coordinate algorithm and is meant to be called in a child process,
 * as it is computationally expensive and would otherwise block the event loop.
 */

const nj = require("numjs");
const math = require("mathjs");

/**
 * This listener is invoked from the main process and sends back the result once the computation is done
 */
process.on("message", forest => {
    const forestMap = computeForestMap({forest});
    process.send(forestMap);
});


// There is no straightforward way to compute a gaussian distribution in Javascript, therefore this hardcoded array
const GAUSSIAN_1D = nj.array([[0.058750, 0.100669, 0.162991, 0.249352, 0.360448,
    0.492325, 0.635391, 0.774837, 0.892813, 0.972053, 1.000000, 0.972053, 0.892813,
    0.774837, 0.635391, 0.492325, 0.360448, 0.249352, 0.162991, 0.100669, 0.058750]]);
const GAUSSIAN_2D = nj.dot(GAUSSIAN_1D.T, GAUSSIAN_1D);

const argmax = arr => arr.indexOf(Math.max(...arr));

/**
 * Object returned by computeForestMap()
 * @typedef {Object} TreePosition
 * @property {number} strength - Strength of the tree. Between 0 and 1
 * @property {number} x - X coordinate of the tree. Between 0 and N
 * @property {number} y - Y coordinate of the tree. Between 0 and N
 */

/**
 *
 * Computes the 2D spacial coordinates of a given forest
 *
 * This is an implementation of the algorithm proposed by:
 * > Hänsch, R. and Hellwich, O. (2015).
 * > Performance assessment and interpretation of random forests by three-dimensional visualizations. pages 149–156.
 *
 * To understand the options, consult this paper.
 *
 * @param {Object} forest - Forest object as returned by parser.createForest()
 * @param {number} [rmax = 50] - Max distance
 * @param {number} [rmin = 10] - Min distance
 * @param {number} [width = 5] - Width of the ring around each tree used to compute the voting space
 * @param {number} [N = 100] - Length & Width of the space where the trees shall be placed
 * @returns {TreePosition[]} - List of tree positions for all trees in the forest
 */
function computeForestMap({
    forest,
    rmax = 50,
    rmin = 10,
    width = 5,
    N = 100
}) {
    // some pre-calculations
    const X = math.matrix(Array(N).fill(null).map(() => math.range(1, N + 1)));
    const Y = math.transpose(X);

    const treeStrengths = forest.trees.map(tree => tree.strength);

    // Init empty output matrix (x and y coordinates for each tree)
    let position = math.zeros(2, treeStrengths.length);

    // Init empty NxN voting spaces for each tree
    let votingMatrices = math.zeros(N, N, treeStrengths.length);

    console.time('Computing forest map');
    for (let t1 = 0; t1 < treeStrengths.length; t1++) {
        // find tree with current maximal strength
        const i = argmax(treeStrengths);
        // if its the first tree, define position as center
        if (t1 === 0) {
            position = math.subset(position, math.index([0, 1], i), [[N / 2], [N / 2]])
        } else {
            // else get current voting space of this tree
            const tmp = math.subset(votingMatrices, math.index(math.range(0, N), math.range(0, N), i));
            // Set the coordinates of the maximum index of the voting space
            const pos = argmax(math.flatten(tmp).valueOf());
            const ix = pos / N;
            const iy = pos % N;
            position = math.subset(position, math.index([0, 1], i), [[ix], [iy]])
        }
        for (let t = 0; t < treeStrengths.length; t++) {
            // skip current tree
            if (t === i) continue;

            // transform correlation into distance
            const distance = (1 - forest.correlationMatrix[i][t]) * rmax + rmin;

            // produce voting image
            const r = math.sqrt(
                math.add(
                    math.dotPow(math.subtract(X, position.valueOf()[0][i]), 2),
                    math.dotPow(math.subtract(Y, position.valueOf()[1][i]), 2)
                )
            );
            const votingImage = math.number(math.smaller(math.abs(math.subtract(r, distance)), width));

            // Pad voting image with zeros to 120x120, so the convolution will return a 100x100 result
            const paddedVotingImage = math.subset(math.zeros(N + 20, N + 20), math.index(math.range(10, N + 10), math.range(10, N + 10)), votingImage);
            const tmp = math.matrix(nj.array(paddedVotingImage.valueOf()).convolve(GAUSSIAN_2D).tolist());

            // vote
            const oldVotingImage = math.subset(votingMatrices, math.index(math.range(0, N), math.range(0, N), t));
            const newVotingImage = math.add(oldVotingImage, math.reshape(tmp, [N, N, 1]));
            votingMatrices = math.subset(votingMatrices, math.index(math.range(0, N), math.range(0, N), t), newVotingImage)
        }

        // "delete" current tree from list
        treeStrengths[i] = 0;
    }
    console.timeEnd('Computing forest map');

    return forest.trees.map((tree, i) => {
        const coordinates = math.subset(position, math.index([0, 1], i)).valueOf();
        return {
            strength: tree.strength,
            x: coordinates[0][0],
            y: coordinates[1][0]
        };
    });
}