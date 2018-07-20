import * as d3 from "d3";

export {drawForest};

function drawForest({
    svg,
    forest,

    width = 300,
    height = 300,
}) {
    const size = Math.min(width, height);

    // Adapt SVG size
    svg.style("width", size).style("height", size);


    console.log(forest);

    // Draw trees
    svg.selectAll("circle")
        .data(forest.trees)
        .enter().append("circle")
        .attr("cy", d => d.y / 100 * size)
        .attr("cx", d => d.x / 100 * size)
        .attr("r", d => Math.sqrt(d.strength / Math.PI) * 5 + 2)  // TODO adapt to size
        .style("fill", d => treeColor(d));
}

function treeColor(tree) {
        return d3.scaleLinear()
            .domain([1, 0.5, 0])
            .range(["green", "green", "red"])
            (tree.strength);
}