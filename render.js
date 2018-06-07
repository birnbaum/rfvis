const D3Node = require("d3-node");
const fs = require("fs");
const util = require('util');
const fs_writeFile = util.promisify(fs.writeFile);
const svg2png = require("svg2png");

const bar = ({
    data,
    d3,
    width: _width = 960,
    height: _height = 500,
    margin: _margin = { top: 20, right: 20, bottom: 30, left: 40 },
}) => {

    const width = _width - _margin.left - _margin.right;
    const height = _height - _margin.top - _margin.bottom;

    // set the ranges
    const x = d3.scaleBand()
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .range([height, 0]);

    const svg = d3n.createSVG(_width, _height)
        .append("g")
        .attr("transform", `translate(${_margin.left}, ${_margin.top})`);

    x.domain(data.map((d) => d.key));
    y.domain([0, d3.max(data, (d) => d.value)]);

    // append the rectangles for the bar chart
    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", (d) => x(d.key))
        .attr("width", x.bandwidth())
        .attr("y", (d) => y(d.value))
        .attr("height", (d) => height - y(d.value));

    // add the x Axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    // add the y Axis
    svg.append("g").call(d3.axisLeft(y));
};

const csvString = fs.readFileSync("data/data.csv").toString();

const d3n = new D3Node({
    selector: "#chart",
    // styles: _svgStyles + _style,
    container: `<div id="chart"></div>`
});

const d3 = d3n.d3;
const data = d3.csvParse(csvString);
bar({ data: data, d3: d3 });

// create output files
output("./output", d3n);

function output(outputName, d3n) {

    if (d3n.options.canvas) {
        const canvas = d3n.options.canvas;
        console.log("canvas output...", canvas);
        canvas.pngStream().pipe(fs.createWriteStream(outputName+".png"));
        return;
    }

    fs.writeFile(outputName+".html", d3n.html(), function () {
        console.log(">> Done. Open \""+outputName+".html\" in a web browser");
    });

    const svgBuffer = new Buffer(d3n.svgString(), "utf-8");
    svg2png(svgBuffer)
        .then(buffer => fs_writeFile(outputName+".png", buffer))
        .catch(e => console.error("ERR:", e))
        .then(err => console.log(">> Exported: \""+outputName+".png\""));
}