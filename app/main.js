import * as d3 from "d3";
import {drawTree, resetTree} from "./draw_tree.mjs";
import {drawForest} from "./draw_forest.mjs";

(async function() {
    const forest = await (await fetch("http://localhost:3000/data")).json();

    // -----------------------
    const forestSvg = d3.select('#forest');
    drawForest({
        svg: forestSvg,
        forest: forest
    });
    // -----------------------

    const treeSvg = d3.select('#tree');

	function updateTreeVisualization(treeId, maxDepth = 2) {
        resetTree(treeSvg);
        drawTree({
            svg: treeSvg,
            tree: forest.trees[treeId],
            totalSamples: forest.totalSamples,

            maxDepth: maxDepth
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
