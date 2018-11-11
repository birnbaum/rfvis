

/**
 * Downloads the provided SVG DOM element as an SVG file
 * @param {Object} svg - SVG DOM element
 * @param {string} filename - Name of the output file
 */
function downloadSvg(svg, filename) {
    const svgNode = svg.node().cloneNode(true);  // Deep clone of SVG DOM element

    // Adding SVG attributes and removing HTML attributes
    svgNode.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgNode.setAttribute("version", "1.1");
    svgNode.removeAttribute("id");

    svgNode.setAttribute("width", svgNode.style.width);
    svgNode.style.width = "";
    svgNode.setAttribute("height", svgNode.style.height);
    svgNode.style.height = "";

    const svgContent = svgNode.outerHTML;
    const blob = new Blob([svgContent], {type: "image/svg+xml;charset=utf-8;"});
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        const link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}