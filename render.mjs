import D3Node from "d3-node";
import * as fs from "fs";
import * as util from 'util';
import svg2png from "svg2png";
import {drawTree} from "./draw.mjs";
import createForest from "./prepare_data.mjs";

const fs_writeFile = util.promisify(fs.writeFile);

const d3n = new D3Node({
    selector: "#chart",
    styles: "#chart svg {background: #fff}",
    container: `<div id="chart"></div>`
});

const statisticsDir = process.argv[2] + '/statistics';
const summaryFile = process.argv[2] + '/summary.txt';

const forest = createForest(summaryFile, statisticsDir);

const _margin = { top: 0, right: 0, bottom: 0, left: 0 };
const width = 1000 - _margin.left - _margin.right;
const height = 800 - _margin.top - _margin.bottom;
const svg = d3n.createSVG(width, height)
    .append("g")
    .attr("transform", `translate(${_margin.left}, ${_margin.top})`);

drawTree({
    svg: svg,
    tree: forest.trees[0],
    totalSamples: forest.totalSamples
});

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
        console.log(">> Exported \""+outputName+".html\"");
    });

    const svgBuffer = new Buffer(d3n.svgString(), "utf-8");
    svg2png(svgBuffer)
        .then(buffer => fs_writeFile(outputName+".png", buffer))
        .catch(err => console.error(err))
        .then(() => console.log(">> Exported: \""+outputName+".png\""));
}