import * as d3 from "d3";
import {treeMouseover, mouseout} from "./sidebar_templates";

export {drawForest};

/**
 * Draws a forest on the provided SVG if it contains any trees or prints "Computing forest positions..." otherwise
 * @param svg {Selection} - D3 selection of the target SVG
 * @param trees {Tree[]} - List of trees extended with coordinates, ids and an update function
 * @param size {number} - Height and width of the target SVG
 */
function drawForest({
    svg,
    trees,
    size = 300,
}) {
    // Adapt SVG size
    svg.style("width", size + "px").style("height", size + "px");

    // Draw trees
    svg.selectAll("circle")
        .data(trees)
        .enter().append("circle")
        .attr("cy", d => d.y / 100 * size)
        .attr("cx", d => d.x / 100 * size)
        .attr("r", d => treeSize(d, size / 20))
        .style("fill", d => treeColor(d))
        .on("mouseover", treeMouseover)
        .on("mouseout", mouseout)
        .on("click", d => d.updateVisualization());
}

function treeColor(tree) {
        return d3.scaleLinear()
            .domain([1, 0.5, 0])
            .range(["green", "green", "red"])
            (tree.strength);
}

function treeSize(tree, maxRadius) {
    const radius = Math.sqrt(tree.strength / Math.PI);
    return d3.scaleLinear()
        .domain([0, Math.sqrt(1 / Math.PI)])
        .range([1, maxRadius])
        (radius)
}