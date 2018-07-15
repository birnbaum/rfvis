import * as d3 from "d3";

export {drawForest};

function drawForest({
    svg,
    forest,

    width = 300,
    height = 300,
}) {
    // Adapt SVG size
    svg.style("width", width).style("height", height);

    console.log(forest.trees);

    // Draw trees
    svg.selectAll("circle")
        .data(forest.trees)
        .enter().append("circle")
        .attr("cy", d => d.y * 3)
        .attr("cx", d => d.x * 3)
        .attr("r", d => Math.sqrt(d.strength / Math.PI) * 5 + 2)
        .style("fill", d => treeColor(d));
}

function treeColor(tree) {
        return d3.scaleLinear()
            .domain([1, 0.5, 0])
            .range(["green", "green", "red"])
            (tree.strength);
}