import * as d3 from "d3";
import {component} from "d3-component";

export {drawPie};

const arc = d3.arc().innerRadius(0);
const slice = component("path")
    .render((selection, d) => {
        selection
            .attr("d", arc(d))
            .attr("fill", "#f4f4f4")
            .attr("stroke", "#707070")
            .attr("stroke-width", 1)
            .attr("stroke-linejoin", "round");
    });
const pie = component("g")
    .render((selection, {
        radius,
        sliceWeights,
    }) => {
        const slices = d3.pie()
            .value(d => d.value)
            (sliceWeights);
        arc.outerRadius(radius);
        selection
            .call(slice, slices);
    });

function drawPie(svg, x, y, radius, weights) {
    const sliceWeights = {sliceWeights: weights.map(weight => ({value: weight}))};
    svg.append("g")
        .attr("transform", `translate(${x}, ${y})`)
        .call(pie, sliceWeights, {
            radius: radius
        });
}
