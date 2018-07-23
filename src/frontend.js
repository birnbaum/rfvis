import * as d3 from "d3";
import {drawTree, resetTree} from "./draw_tree.js";
import {drawForest} from "./draw_forest.js";

import "../scss/style.scss"
import {updateForestAndTreeInfo} from "./frontend_sidebar";

/**
 * Main frontend function which is executed on load.
 *
 * Initializes the tree and forest views and all UI element listeners + keyboard shortcuts
 */
(async function() {
    const forest = await (await fetch(window.location.origin + "/data")).json();

    const PADDING = 12;  // Hardcoded for now;

    // TODO use jQuery
    const treeColumnHeight = d3.select("#tree-column").node().offsetHeight - PADDING;
    const treeColumnWidth = d3.select("#tree-column").node().offsetWidth - 2 * PADDING;
    const leftColumnWidth = d3.select("#left-column").node().offsetWidth - 2 * PADDING;

    const treeSvg = d3.select('#tree');
    let treeId = 0;
    let trunkLength = 100;
    let maxDepth = Number.MAX_SAFE_INTEGER;
    let branchColor = "IMPURITY";
    let leafColor = "IMPURITY";

	function updateTreeVisualization(id) {
        resetTree(treeSvg);
        drawTree({
            svg: treeSvg,
            tree: forest.trees[id],
            totalSamples: forest.totalSamples,

            width: treeColumnWidth,
            height: treeColumnHeight,
            trunkLength: trunkLength,

            maxDepth: maxDepth,

            branchColor: branchColor,
            leafColor: leafColor,
		});
        updateForestAndTreeInfo(forest, id);  // Update sidebar info
        treeId = id;
	}

    // Init forest view
    updateForestVisualization(forest, leftColumnWidth, updateTreeVisualization);

	// Init tree view with first tree
	updateTreeVisualization(treeId);


	/* --- UI Element & Keyboard Bindings for Previous/Next Tree --- */

    function nextTree() {
        let id;
        if (treeId === forest.trees.length - 1) {
            id = 0;
        } else {
            id = treeId + 1;
        }
        updateTreeVisualization(id);
    }

    function previousTree() {
        let id;
        if (treeId === 0) {
            id = forest.trees.length - 1;
        } else {
            id = treeId - 1;
        }
        updateTreeVisualization(id);
    }

    document.onkeyup = function(e) {
        if (e.key === "ArrowLeft") previousTree();
        else if (e.key === "ArrowRight") nextTree();
    };

	d3.selectAll('#next-tree').on('click', nextTree);
	d3.selectAll('#previous-tree').on('click', previousTree);


	/* --- UI Element Bindings for Settings --- */

    d3.select("#reset-zoom").on('click', updateTreeVisualization);

    d3.select("#tree-depth").on("input", function() {
        maxDepth = this.value;
        updateTreeVisualization();
    });

    d3.select("#trunk-length").on("input", function() {
        trunkLength = this.value;
        updateTreeVisualization();
    });

    d3.select("#branch-color").on("change", function() {
        branchColor = this.value;
        updateTreeVisualization();
    });

    d3.select("#leaf-color").on("change", function() {
        leafColor = this.value;
        updateTreeVisualization();
    });
})();


/**
 * Polls the "/positions" endpoint until the forest position computation is done and returns the results
 */
function updateForestVisualization(forest, size, updateFunction, interval = 1) {
    const forestSvg = d3.select('#forest');

    const checkCondition = (resolve, reject) => {
        fetch(window.location.origin + "/positions")
            .then(res => res.json())
            .then(json => {
                const trees = forest.trees.map((tree, i) => {
                    tree.id = i + 1;
                    tree.x = json.positions[i].x;
                    tree.y = json.positions[i].y;
                    tree.updateVisualization = () => updateFunction(i);
                    return tree;
                });
                drawForest({
                    svg: forestSvg,
                    trees: trees,
                    size: size,
                });
                if (json.progress !== 100) {
                    setTimeout(checkCondition, interval * 1000, resolve, reject);
                }
            })
            .catch(console.error);
    };
    return new Promise(checkCondition);
}