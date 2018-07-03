import * as d3 from "d3";
import {component} from "d3-component";

export {drawPie};

const arc = d3.arc().innerRadius(0);
const slice = component("path")
    .render((selection, slice) => {
        selection
            .attr("d", arc(slice))
            .attr("fill", slice.data.color)
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
            .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
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
