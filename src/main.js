import * as d3 from "d3";
import {drawTree, resetTree} from "./draw_tree.js";
import {drawForest} from "./draw_forest.js";

import "../scss/style.scss"

(async function() {
    const forest = await (await fetch("http://localhost:3000/data")).json();

    const PADDING = 12;  // Hardcoded for now;

    // TODO use jQuery
    const treeColumnHeight = d3.select("#tree-column").node().offsetHeight - PADDING;
    const treeColumnWidth = d3.select("#tree-column").node().offsetWidth - 2 * PADDING;
    const leftColumnWidth = d3.select("#left-column").node().offsetWidth - 2 * PADDING;

    // -----------------------
    const forestSvg = d3.select('#forest');
    drawForest({
        svg: forestSvg,
        forest: forest,

        width: leftColumnWidth,
    });
    // -----------------------

    const treeSvg = d3.select('#tree');

    let treeId = 0;
    let trunkLength = 100;
    let maxDepth = Number.MAX_SAFE_INTEGER;
    let branchColor = "IMPURITY";
    let leafColor = "IMPURITY";

	function updateTreeVisualization() {
        resetTree(treeSvg);
        drawTree({
            svg: treeSvg,
            tree: forest.trees[treeId],
            totalSamples: forest.totalSamples,

            width: treeColumnWidth,
            height: treeColumnHeight,
            trunkLength: trunkLength,

            maxDepth: maxDepth,

            branchColor: branchColor,
            leafColor: leafColor,
		});
	}
	updateTreeVisualization();


	/* --- UI Element & Keyboard Bindings for Previous/Next Tree --- */

    function nextTree() {
        if (treeId === forest.trees.length - 1) {
            treeId = 0;
        } else {
            treeId++;
        }
        updateTreeVisualization();
    }

    function previousTree() {
        if (treeId === 0) {
            treeId = forest.trees.length - 1;
        } else {
            treeId--;
        }
        updateTreeVisualization();
    }

    document.onkeyup = function(e) {
        if (e.key === "ArrowLeft") previousTree();
        else if (e.key === "ArrowRight") nextTree();
    };

	d3.selectAll('#next-tree').on('click', nextTree);
	d3.selectAll('#previous-tree').on('click', previousTree);


	/* --- UI Element Bindings for Settings --- */

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
