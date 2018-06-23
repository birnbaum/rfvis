import * as d3 from "d3";
import {drawTree, resetTree} from "./draw_tree.js";
import {drawForest} from "./draw_forest.js";

import "../scss/style.scss"

(async function() {
    const forest = await (await fetch("http://localhost:3000/data")).json();

    const PADDING = 12;  // Hardcoded for now;
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

	function updateTreeVisualization(treeId, maxDepth = 1000) {
        resetTree(treeSvg);
        drawTree({
            svg: treeSvg,
            tree: forest.trees[treeId],
            totalSamples: forest.totalSamples,

            width: treeColumnWidth,
            height: 800,
            branchLength: 300,

            maxDepth: maxDepth,

            branchColor: "IMPURITY",
            leafColor: "IMPURITY",
		});
	}

	let treeId = 0;
	updateTreeVisualization(treeId);

	d3.selectAll('.next').on('click', () => {
		if (treeId === forest.trees.length-1) return alert("Last");
		treeId++;
		updateTreeVisualization(treeId);
	});

	d3.selectAll('.previous').on('click', () => {
		if (treeId === 0) return alert("First");
		treeId--;
		updateTreeVisualization(treeId);
	});

    d3.select("#nValue").on("input", function(i) {
        updateTreeVisualization(treeId, this.value);
    });
})();
