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

    // Draw trees
    svg.selectAll("circle")
        .data([32, 57, 112])
        .enter().append("circle")
        .attr("cy", 60)
        .attr("cx", (d, i) => i * 100 + 30)
        .attr("r", d => Math.sqrt(d));
}