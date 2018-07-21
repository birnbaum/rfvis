import * as d3 from "d3";

export {drawForest};

function drawForest({
    svg,
    positions,
    size = 300,
}) {
    // Adapt SVG size
    svg.style("width", size).style("height", size);

    const forestText = d3.select('#forest-progress');

    // Clear forest view
    //svg.selectAll("circle").remove();

    if (positions.length > 0) {
        forestText.remove();
        // Draw trees
        svg.selectAll("circle")
            .data(positions)
            .enter().append("circle")
            .attr("cy", d => d.y / 100 * size)
            .attr("cx", d => d.x / 100 * size)
            .attr("r", d => Math.sqrt(d.strength / Math.PI) * 5 + 2)  // TODO adapt to size
            .style("fill", d => treeColor(d));
    } else {
        forestText.text("Computing forest positions...");
    }
}

function treeColor(tree) {
        return d3.scaleLinear()
            .domain([1, 0.5, 0])
            .range(["green", "green", "red"])
            (tree.strength);
}