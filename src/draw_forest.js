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

    // Active tree circles
    svg.append("g").selectAll("circle")
        .data(trees)
        .enter().append("circle")
        .attr("cy", d => d.y / 100 * size)
        .attr("cx", d => d.x / 100 * size)
        .attr("r", d => treeSize(d, size / 25) + size / 100)
        .attr("class", "tree-circle")
        .attr("id", (d, i) => "tree-circle-" + i)
        .style("fill", "white")
        .style("opacity", 0)
        .style("stroke", d => treeColor(d))
        .style("stroke", size / 300);

    // Draw trees
    svg.append("g").selectAll("circle")
        .data(trees)
        .enter().append("circle")
        .attr("cy", d => d.y / 100 * size)
        .attr("cx", d => d.x / 100 * size)
        .attr("r", d => treeSize(d, size / 25))
        .style("fill", d => treeColor(d))
        .on("mouseover", treeMouseover)
        .on("mouseout", mouseout)
        .on("click", d => d.updateVisualization());
}

function treeColor(tree) {
    return d3.scaleLinear()
        .domain([1, 0.5, 0.05, 0])
        .range(["red", "red", "green", "green"])
        (tree.oobError);
}

function treeSize(tree, maxRadius) {
    const radius = area => Math.sqrt(area / Math.PI);
    return d3.scaleLinear()
        .domain([0, radius(0.6), radius(1)])
        .range([maxRadius / 2, maxRadius / 2, maxRadius])
        (radius(1 - tree.oobError))
}