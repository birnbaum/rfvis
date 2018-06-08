import * as d3 from "d3";
import {component} from "d3-component";

const svg = d3.select("svg");
const width = +svg.attr("width");
const height = +svg.attr("height");
const pie = d3.pie().value(d => d.value);
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

const connector = component("line")
    .render((selection, {parentRadius, stemDistance, radius}) => {
        if(parentRadius !== 0){
            selection
                .attr("x1", -radius)
                .attr("y1", 0)
                .attr("x2", -(stemDistance - parentRadius))
                .attr("y2", 0)
                .attr("stroke", "#a0a0a0");
        }
    });

const fractal = component("g")
    .render((selection, d) => {
        const {
            radius,
            parentRadius,
            angle,
            children,
            stemSize,
            stemWeight,
            rotateChildren
        } = d;

        const slices = pie(children);
        arc.outerRadius(radius);


        //const translate = (parentRadius + radius)/2 * stem;
        //const translate = radius * stem;
        const base = parentRadius + radius;
        const stemDistance = base + (
            (parentRadius * stemWeight + radius * (1 - stemWeight)) / 2
        ) * stemSize;
        const degrees = angle / Math.PI * 180;

        const fractals = slices
            .filter(d => d.data.children)
            .map(d => {

                const parentRadius = radius;
                const parentSliceFraction = (d.endAngle - d.startAngle) / (2*Math.PI);
                const parentTotalArea =  Math.PI * radius * radius;
                const parentSliceArea = parentTotalArea * parentSliceFraction;
                const childRadius = Math.sqrt(parentSliceArea / Math.PI);

                return Object.assign({}, d.data, {
                    radius: childRadius,
                    parentRadius: radius,
                    angle: (d.startAngle + d.endAngle) / 2 - Math.PI/2,
                    stemSize,
                    stemWeight,
                    rotateChildren
                });
            });

        selection
            .attr("transform", `rotate(${degrees}) translate(${stemDistance})`)
            .call(connector, d, {stemDistance, rotateChildren, degrees})
            .call(slice, slices)
            .call(fractal, fractals);
    });

const generateData = (value) => {
    const epsilon = 0.02;
    const childRatios = [1/2, 1/4, 1/8, 1/8 * 2/3, 1/8 * 1/3];
    const d = { value };
    if(value > epsilon){
        d.children = childRatios
            .map(ratio => ratio * value)
            .map(generateData);
    }
    return d;
};

const data = generateData(1);

d3.select("svg").append("g")
    .attr("transform", "translate(313, 224)")
    .call(fractal, data, {
        radius: 53,
        parentRadius: 0,
        angle: 0,
        stemSize: 3.2,

        // 1 = weighted by parent radius,
        // 0 = weighted by child radius
        stemWeight: 1.007155150848
    });