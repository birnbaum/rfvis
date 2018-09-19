/**
 * This script contains the coordinate algorithm and is meant to be called in a child process,
 * as it is computationally expensive and would otherwise block the event loop.
 */

import Vector from "./Vector.js";

export {computeForestMap}

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
}) {
    const coordinates = arrangeInitial(forest.trees.length);
    console.log("Computing coordinated for " + coordinates.length + " trees");

    // compute D and D*
    const D = [];
    const DStar = [];
    for (let i = 0; i < forest.trees.length; i++ ) {
        D.push([]);
        DStar.push([]);
        for (let j = 0; j < forest.trees.length; j++ ) {
            if (i !== j) {
                const c = forest.correlationMatrix[i][j];  // supportpoints are ordered by strength ?!?!?!?!?!?
                D[i][j] = 1 / Math.max(0.05, c);
                DStar[i][j] = coordinates[i].subtract(coordinates[j]).getLength();
            }
        }
    }
    let oldError = calculateError(D, DStar);
    let newError = oldError;
    console.log("initial error: " + oldError);

    // move support points
    for (let iteration = 0; iteration < coordinates.length * 1000; iteration++) {
        for (let i = 0; i < coordinates.length; i++) {
            let coordinate = coordinates[i];
            for (let j = 0; j < coordinates.length; j++) {
                if (i !== j && DStar[i][j] > 0) {
                    const delta = coordinates[i]
                        .subtract(coordinates[j])
                        .multiply((1 / coordinates.length) * ((D[i][j] - DStar[i][j]) / DStar[i][j]));
                    coordinate = coordinate.add(delta);
                }
            }
            coordinates[i] = coordinate;

            //update DStar
            for (let j = 0; j < D[i].length; j++) {
                if (i !== j) {
                    DStar[i][j] = coordinates[i].subtract(coordinates[j]).getLength();
                    DStar[j][i] = DStar[i][j];
                }
            }
        }

        newError = calculateError(D, DStar);
        const drop = oldError - newError;

        if (drop > 0 && drop < 0.000001) {
            console.log("no further drop in error ... break after " + iteration + " iterations with an final error of " + newError);
            break;
        }
        oldError = newError;
    }

    // get mininmal distance
    let minimalDistance = 1;
    for (let i = 0; i < coordinates.length; i++) {
        for (let j = 0; j < coordinates.length; j++ ) {
            if (i !== j) minimalDistance = Math.min(minimalDistance, DStar[i][j]);
        }
    }

    // scale minimal distance to 1
    for (let i = 0; i < coordinates.length; i++ ) {
        coordinates[i] = coordinates[i].divide(minimalDistance);
    }

    // update D* of scaled positions
    for (let i = 0; i < coordinates.length; i++ ) {
        for (let j = i + 1; j < coordinates.length; j++ ) {
            DStar[i][j] = coordinates[i].subtract(coordinates[j]).getLength();
        }
    }
    console.log("final error after scaling to min dist: " + calculateError(D, DStar));

    const pixelCoordinated = centerWorld(coordinates);

    return forest.trees.map((tree, i) => {
        return {
            strength: tree.strength,
            x: pixelCoordinated[i].x,
            y: pixelCoordinated[i].y
        };
    });
}

function calculateError(D, DStar) {
    let weight = 0;
    let sum = 0;
    for (let i = 0; i < D.length; i++) {
        for (let j = i + 1; j < D[i].length; j++) {
            weight += D[i][j];
            sum += Math.pow(D[i][j] - DStar[i][j], 2) / D[i][j];
        }
    }
    return sum / weight;
}

function arrangeInitial(numberOfTrees, minDist = 1) {
    const radius = numberOfTrees * minDist / Math.PI;
    const coordinates = [];
    for (let i = 0; i < numberOfTrees; i++) {
        const direction = i * 2 * Math.PI / numberOfTrees;
        coordinates.push(Vector.fromDirectionAndLength(direction, radius));
    }
    return coordinates;
}

function centerWorld(coordinates, pixel = 100, border = 5) {
    let minX = Number.MAX_SAFE_INTEGER;
    let minY = Number.MAX_SAFE_INTEGER;
    let maxX = Number.MIN_SAFE_INTEGER;
    let maxY = Number.MIN_SAFE_INTEGER;
    let maxRadius = 0;

    // get the bounding
    for (const coordinate of coordinates) {
        minX = Math.min( minX, coordinate.x);
        minY = Math.min( minY, coordinate.y);
        maxX = Math.max( maxX, coordinate.x);
        maxY = Math.max( maxY, coordinate.y);
        maxRadius = Math.max(maxRadius, coordinate.getLength());
    }

    const center = new Vector((minX + maxX) / 2, (minY + maxY) / 2);
    const factor = ((pixel - border) / maxRadius) / 2;

    // center and calculate new size
    return coordinates.map(coordinate => {
        return coordinate
            .subtract(center)
            .multiply(factor)
            .add(new Vector(50, 50));
    });
}
