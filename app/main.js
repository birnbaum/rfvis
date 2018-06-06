"use strict";

import getForest from "./forest.js";
import * as d3 from "./d3.js";


import {TreeVisualizationConfig, generateTreeElements, drawTree, resetTree} from "./draw.js";

(async function() {
	const forest = await getForest();

	function updateTreeVisualization(treeId) {
        resetTree();
		const tree = forest.trees[treeId];
		const {branches, leafs} = generateTreeElements(tree);
		const config = new TreeVisualizationConfig({totalSamples: forest.totalSamples});
		drawTree(branches, leafs, config);
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
