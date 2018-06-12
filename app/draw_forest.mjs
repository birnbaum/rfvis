import * as d3 from "d3";

export {drawForest};

function drawForest({
    svg,
    forest
}) {
    console.log(forest);
    svg.selectAll("circle")
        .data([32, 57, 112])
        .enter().append("circle")
        .attr("cy", 60)
        .attr("cx", (d, i) => i * 100 + 30)
        .attr("r", d => Math.sqrt(d));
}