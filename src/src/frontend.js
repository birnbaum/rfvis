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
 * Initializes the tree and forest views and all UI element listeners + keyboard shortcuts.
 * This function should be refactored using a proper frontend lib (vue.js/React/Angular) instead of jQuery.
 */
(async function() {

    const leftColumnWidth = d3.select("#sidebar").node().offsetWidth;

	function updateTreeVisualization(id) {
        resetTree(treeSvg);
        drawTree({...});
        updateForestAndTreeInfo(forest, id);
        if (id !== currentTreeId) {
            updateMaxDepthInput(forest.trees[id]);
        }
        $(".tree-circle").each(function() {
            $(this).css("opacity", 0);
        });
        $("#tree-circle-" + id).css("opacity", 1);
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

    /* ------ SVG Download Buttons ------ */
    $("#download-forest").click(function() {
        downloadSvg(forestSvg, `forest.svg`);
    });

    $("#download-tree").click(function() {
        downloadSvg(treeSvg, `tree-${currentTreeId}.svg`);
    });

    /* ------ Branch/Leaf coloring ------ */
    const $colorTab = $("#color-tab");
    const $pathTab = $("#path-tab");
    const $colorView = $("#color-view");
    const $pathView = $("#path-view");
    const $branchColorSelect = $("#branch-color-select");
    const $leafColorSelect = $("#leaf-color-select");
    const $pathLeafInput = $("#path-leaf-input");
    $pathView.hide();

    $colorTab.click(function() {
        $colorTab.addClass("is-active");
        $pathTab.removeClass("is-active");
        $colorView.show();
        $pathView.hide();
        branchColor = $branchColorSelect.val();
        leafColor = $leafColorSelect.val();
        pathLeafID = null;
        updateTreeVisualization(currentTreeId);
    });
    $branchColorSelect.change(function() {
        branchColor = $branchColorSelect.val();
        updateTreeVisualization(currentTreeId);
    });
    $leafColorSelect.change(function() {
        leafColor = $leafColorSelect.val();
        updateTreeVisualization(currentTreeId);
    });

    $pathTab.click(function() {
        $colorTab.removeClass("is-active");
        $pathTab.addClass("is-active");
        $colorView.hide();
        $pathView.show();
        branchColor = "PATH";
        leafColor = "PATH";
        pathLeafID = Number.parseInt($pathLeafInput.val());
        updateTreeVisualization(currentTreeId);
    });
    $pathLeafInput.on("input", function() {
        pathLeafID = Number.parseInt($pathLeafInput.val());
        updateTreeVisualization(currentTreeId);
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
 * @returns {number}
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
    return maxDepth + 1;
}

/**
 * Downloads the provided SVG DOM element as an SVG file
 * @param {Object} svg - SVG DOM element
 * @param {string} filename - Name of the output file
 */
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