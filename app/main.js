import * as d3 from "d3";
import {drawTree, resetTree} from "../draw.mjs";

(async function() {
    const forest = await (await fetch("http://localhost:3000/data")).json();

    const treeSvg = d3.select('#tree');

	function updateTreeVisualization(treeId) {
        resetTree(treeSvg);
        drawTree({
            svg: treeSvg,
            tree: forest.trees[treeId],
            totalSamples: forest.totalSamples
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
})();
