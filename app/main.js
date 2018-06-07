"use strict";

import getForest from "./forest.mjs";
import * as d3 from "d3";
import {TreeVisualizationMapping, generateTreeElements, drawTree, resetTree} from "./draw.mjs";

(async function() {
	const forest = await getForest();

	function updateTreeVisualization(treeId) {
        resetTree();
		const tree = forest.trees[treeId];
		const {branches, leafs} = generateTreeElements({tree: tree});
		const config = new TreeVisualizationMapping({totalSamples: forest.totalSamples});
		drawTree({branches, leafs, config});
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
