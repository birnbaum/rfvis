const D3Node = require('d3-node');

function bar({
  data,
  selector: _selector = '#chart',
  container: _container = `<div id="chart"></div>`,
  style: _style = '',
  width: _width = 960,
  height: _height = 500,
  margin: _margin = { top: 20, right: 20, bottom: 30, left: 40 },
  barColor: _barColor = 'steelblue',
  barHoverColor: _barHoverColor = 'brown',
}) {
  const _svgStyles = `
    .bar { fill: ${_barColor}; }
    .bar:hover { fill: ${_barHoverColor}; }
  `;

  const d3n = new D3Node({
    selector: _selector,
    styles: _svgStyles + _style,
    container: _container
  });

  const d3 = d3n.d3;

  const width = _width - _margin.left - _margin.right;
  const height = _height - _margin.top - _margin.bottom;

  // set the ranges
  const x = d3.scaleBand()
          .range([0, width])
          .padding(0.1);

  const y = d3.scaleLinear()
          .range([height, 0]);

  const svg = d3n.createSVG(_width, _height)
    .append('g')
    .attr('transform', `translate(${_margin.left}, ${_margin.top})`);

  x.domain(data.map((d) => d.key));
  y.domain([0, d3.max(data, (d) => d.value)]);

  // append the rectangles for the bar chart
  svg.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => x(d.key))
      .attr('width', x.bandwidth())
      .attr('y', (d) => y(d.value))
      .attr('height', (d) => height - y(d.value));

  // add the x Axis
  svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));

  // add the y Axis
  svg.append('g').call(d3.axisLeft(y));

  return d3n;
}

const fs = require('fs');
const d3 = require('d3-node')().d3;

const csvString = fs.readFileSync('data/data.csv').toString();
const data = d3.csvParse(csvString);

// create output files
output('./output', bar({ data: data }));

function output(outputName, d3n) {
  const svg2png = require('svg2png');
  
  if (d3n.options.canvas) {
    const canvas = d3n.options.canvas;
    console.log('canvas output...', canvas);
    canvas.pngStream().pipe(fs.createWriteStream(outputName+'.png'));
    return;
  }

  fs.writeFile(outputName+'.html', d3n.html(), function () {
    console.log('>> Done. Open "'+outputName+'.html" in a web browser');
  });

  var svgBuffer = new Buffer(d3n.svgString(), 'utf-8');
  svg2png(svgBuffer)
    .then(buffer => fs.writeFile(outputName+'.png', buffer))
    .catch(e => console.error('ERR:', e))
    .then(err => console.log('>> Exported: '+outputName+'.png"'));
};