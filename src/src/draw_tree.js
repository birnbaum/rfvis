import * as d3 from "d3";
import {drawPie} from "./draw_pie.js";
import {branchMouseover, leafMouseover, mouseout} from "./sidebar_templates.js";
import {InternalNode, LeafNode} from "./TreeNodes";

export {drawTree, resetTree};

/**
 * Draws the visualization of a binary decision tree of the provided SVG
 * @param {Object} options - For details see generateTreeElements()
 */
function drawTree(options) {
    const {
        svg,
        tree,
        totalSamples,

        width,
        height,
        trunkLength,

        maxDepth,

        branchColor: branchColorType,
        leafColor: leafColorType,
        pathLeafID,
    } = options;

    // Draw branches
    svg.selectAll('line')
        .on("mouseover", branchMouseover)
        .on("mouseout", mouseout)
        .on("click", d => {
            resetTree(svg);
            const newOptions = Object.assign({}, options);
            newOptions.totalSamples = d.samples;
            newOptions.tree = Object.assign({}, options.tree);
            newOptions.tree.baseNode = d;
            drawTree(newOptions);
        });

    // Draw leafs
    svg.selectAll('circle')
        .data(leafs)  // This is where we feed the data to the visualization
        .enter()
        .append("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", d => leafSize(d, "SAMPLES", totalSamples))
        .style("fill", d => leafColor(leafColorType, d))
        .on("mouseover", leafMouseover)
        .on("mouseout", mouseout);

    for (const bunch of bunches) {
        drawPie(
            svg,
            bunch,
            leafSize(bunch, "SAMPLES", totalSamples),
            getHistogram(bunch.baseNode, leafColorType, true),
            getHistogram(bunch.baseNode, "BEST_CLASS", true)  // TODO inefficient
        );
    }
}

