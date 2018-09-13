import * as d3 from "d3";
import {drawTree, resetTree} from "./draw_tree.js";
import {drawForest} from "./draw_forest.js";
import {updateForestAndTreeInfo} from "./sidebar_templates";

import "../scss/style.scss"
import {computeForestMap} from "./compute_coordinates";
import {createForest} from "./parser";

/**
 * Main frontend function which is executed on load.
 *
 * Initializes the tree and forest views and all UI element listeners + keyboard shortcuts
 */
(async function() {
    const rawData = await (await fetch(window.location.origin + "/data")).json();
    console.log(rawData);
    const forest = createForest(rawData);
    console.log(forest);

    const leftColumnWidth = d3.select("#sidebar").node().offsetWidth;
    const treeSvg = d3.select('#tree');
    const forestSvg = d3.select("#forest");
    let currentTreeId = 0;
    let trunkLength = 100;
    let branchColor = "PATH";
    let leafColor = "PATH";

	function updateTreeVisualization(id) {
        resetTree(treeSvg);
        drawTree({
            svg: treeSvg,
            tree: forest.trees[id],
            totalSamples: forest.totalSamples,

            width: d3.select("#content").node().offsetWidth,
            height: $(window).height() - 40,
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
    updateForestVisualization(forestSvg, forest, leftColumnWidth, updateTreeVisualization);

	// Init tree view with first tree after short timeout, so the tree size can be adapted to the viewport size
    setTimeout(() => {
        updateTreeVisualization(currentTreeId);
    }, 200);


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
        redrawThrottler();
    });

    d3.select("#reset-tree-depth").on("click", function() {
        updateMaxDepthInput(forest.trees[currentTreeId], true);
        updateTreeVisualization(currentTreeId);
    });

    d3.select("#trunk-length").on("input", function() {
        trunkLength = this.value;
        redrawThrottler();
    });

    d3.select("#branch-color").on("change", function() {
        branchColor = this.value;
        updateTreeVisualization(currentTreeId);
    });

    d3.select("#leaf-color").on("change", function() {
        leafColor = this.value;
        updateTreeVisualization(currentTreeId);
    });

    d3.select("#download-forest").on("click", function() {
        downloadSvg(forestSvg, `forest.svg`);
    });

    d3.select("#download-tree").on("click", function() {
        downloadSvg(treeSvg, `tree-${currentTreeId}.svg`);
    });

    /* ------ Window resize adaptations ------ */
    window.addEventListener("resize", redrawThrottler, false);


    let redrawTimeout;
    let lastEventTime = Date.now();

    /**
     * Updates the tree visualization only after this function was not called for <delta> milliseconds.
     * This allows the user to change the depth and trunk length quickly without the UI freezing because
     * of too many redraws.
     *
     * @param {number} delta
     */
    function redrawThrottler(delta = 500) {
        const eventTime = Date.now();
        if (eventTime < lastEventTime + delta) {
            clearTimeout(redrawTimeout);
        }
        lastEventTime = eventTime;
        redrawTimeout = setTimeout(() => {
            redrawTimeout = null;
            updateTreeVisualization(currentTreeId);
        }, delta);
    }
})();

function updateForestVisualization(forestSvg, forest, size, updateFunction) {
    const trees = computeForestMap({forest}).map((position, i) => {
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

function downloadSvg(svg, filename) {
    const svgNode = svg.node().cloneNode(true);  // Deep clone of SVG DOM element

    // Adding SVG attributes and removing HTML attributes
    svgNode.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgNode.setAttribute("version", "1.1");
    svgNode.removeAttribute("id");

    svgNode.setAttribute("width", svgNode.style.width);
    svgNode.style.width = "";
    svgNode.setAttribute("height", svgNode.style.height);
    svgNode.style.height = "";

    const svgContent = svgNode.outerHTML;
    const blob = new Blob([svgContent], {type: "image/svg+xml;charset=utf-8;"});
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        const link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}