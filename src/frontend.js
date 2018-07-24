import * as d3 from "d3";
import {drawTree, resetTree} from "./draw_tree.js";
import {drawForest} from "./draw_forest.js";
import {updateForestAndTreeInfo} from "./frontend_sidebar";

import "../scss/style.scss"

/**
 * Main frontend function which is executed on load.
 *
 * Initializes the tree and forest views and all UI element listeners + keyboard shortcuts
 */
(async function() {
    const PADDING = 12;
    const forest = await (await fetch(window.location.origin + "/data")).json();
    const leftColumnWidth = d3.select("#left-column").node().offsetWidth - 2 * PADDING;

    const treeSvg = d3.select('#tree');
    let currentTreeId = 0;
    let trunkLength = 100;
    let branchColor = "IMPURITY";
    let leafColor = "IMPURITY";

	function updateTreeVisualization(id) {
	    console.log($("#tree-depth").val());
        resetTree(treeSvg);
        drawTree({
            svg: treeSvg,
            tree: forest.trees[id],
            totalSamples: forest.totalSamples,

            width: d3.select("#tree-column").node().offsetWidth - 2 * PADDING,
            height: $(window).height() - 60,
            trunkLength: trunkLength,

            maxDepth: $("#tree-depth").val(),

            branchColor: branchColor,
            leafColor: leafColor,
		});
        updateForestAndTreeInfo(forest, id);
        if (id !== currentTreeId) {
            updateMaxDepthInput(forest.trees[id]);
        }
        currentTreeId = id;
	}

    /**
     * Sets the maxDepth variable and updates the corresponding input element
     * @param {Tree} tree
     */
    function updateMaxDepthInput(tree, reset = false) {
        const maxDepth = getMaxDepth(tree);
        const $input = $("#tree-depth");
        // If the old setting is equal to the old max, we assume the user did
        // not touch the input and set both values to the new max depth.
        // Otherwise (e.g. if the user manually set the max depth to 5) we assume
        // this same setting should be applied even after the tree view updates
        // and we do not update the value of the input.
        if ($input.val() === $input.attr("max") || reset) {
            $input.val(maxDepth);
        }
        $input.attr({max: maxDepth});
    }

    // Init max depth input
    updateMaxDepthInput(forest.trees[currentTreeId]);

    // Init forest view
    updateForestVisualization(forest, leftColumnWidth, updateTreeVisualization);

	// Init tree view with first tree after short timeout, so the tree size can be adapted to the viewport size
    setTimeout(() => updateTreeVisualization(currentTreeId), 200);


	/* --- UI Element & Keyboard Bindings for Previous/Next Tree --- */

    function nextTree() {
        let id;
        if (currentTreeId === forest.trees.length - 1) {
            id = 0;
        } else {
            id = currentTreeId + 1;
        }
        updateTreeVisualization(id);
    }

    function previousTree() {
        let id;
        if (currentTreeId === 0) {
            id = forest.trees.length - 1;
        } else {
            id = currentTreeId - 1;
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

    d3.select("#reset-zoom").on("click", function() {
        updateTreeVisualization(currentTreeId);
    });

    d3.select("#tree-depth").on("input", function() {
        updateTreeVisualization(currentTreeId);
    });

    d3.select("#reset-tree-depth").on("click", function() {
        console.log("lol")
        updateMaxDepthInput(forest.trees[currentTreeId], true);
        updateTreeVisualization(currentTreeId);
    });

    d3.select("#trunk-length").on("input", function() {
        trunkLength = this.value;
        updateTreeVisualization(currentTreeId);
    });

    d3.select("#branch-color").on("change", function() {
        branchColor = this.value;
        updateTreeVisualization(currentTreeId);
    });

    d3.select("#leaf-color").on("change", function() {
        leafColor = this.value;
        updateTreeVisualization(currentTreeId);
    });


    /* ------ Window resize adaptations ------ */

    // Snipped taken from https://developer.mozilla.org/en-US/docs/Web/Events/resize
    window.addEventListener("resize", resizeThrottler, false);
    let resizeTimeout;
    function resizeThrottler() {
        // ignore resize events as long as an actualResizeHandler execution is in the queue
        if (!resizeTimeout) {
            resizeTimeout = setTimeout(() => {
                resizeTimeout = null;
                updateTreeVisualization(currentTreeId);
            }, 500);
        }
    }
})();


/**
 * Polls the "/positions" endpoint until the forest position computation is done and returns the results
 */
function updateForestVisualization(forest, size, updateFunction, interval = 1) {
    const forestSvg = d3.select("#forest");

    const checkCondition = (resolve, reject) => {
        fetch(window.location.origin + "/positions")
            .then(res => res.json())
            .then(json => {
                const trees = json.positions.map((position, i) => {
                    const tree = forest.trees[i];
                    tree.id = i + 1;
                    tree.x = position.x;
                    tree.y = position.y;
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

/**
 * Finds the maximal depth of a tree
 * @param {Tree} tree
 */
function getMaxDepth(tree) {
    let maxDepth = 0;
    function findMaxDepth(node) {
        if (node.children) {
            findMaxDepth(node.children[0]);
            findMaxDepth(node.children[1]);
        } else if (node.depth > maxDepth) {
            maxDepth = node.depth;
        }
    }
    findMaxDepth(tree.baseNode);
    return maxDepth;
}