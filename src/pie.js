import * as d3 from "d3";
import {component} from "d3-component";

export {drawPie};

const colorScale = d3.scaleLinear()
    .domain([0, 1])
    .range(["green", "red"]);

const arc = d3.arc().innerRadius(0);
const slice = component("path")
    .render((selection, slice) => {
        selection
            .attr("d", arc(slice))
            .attr("fill", colorScale(slice.data.impurity))
            .attr("stroke", "#fff")
            .attr("stroke-width", 0.5)
            .attr("stroke-linejoin", "round");
    });
const pie = component("g")
    .render((selection, {
        radius,
        slices,
    }) => {
        const d3Slices = d3.pie()
            .value(d => d.value)
            .sort((a, b) => a.impurity.localeCompare(b.impurity))
            (slices);
        arc.outerRadius(radius);
        selection
            .call(slice, d3Slices);
    });

function drawPie(svg, x, y, radius, slices) {
    svg.append("g")
        .attr("transform", `translate(${x}, ${y})`)
        .call(pie, {slices}, {
            radius: radius
        });
}
