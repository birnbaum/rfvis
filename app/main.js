"use strict";

import getForest from "./forest.mjs";
import * as d3 from "d3";
import {drawTree, resetTree} from "./draw.mjs";

(async function() {
	const forest = await getForest();

	function updateTreeVisualization(treeId) {
        resetTree(d3);
        drawTree({
            d3: d3,
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
