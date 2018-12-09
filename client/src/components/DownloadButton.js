import React from "react";
import PropTypes from "prop-types";

export default class DownloadButton extends React.Component {
    static propTypes = {
        filename: PropTypes.string.isRequired,
        svgId: PropTypes.string.isRequired,
    };

    render() {
        return (
            <span className="DownloadButton button is-small">
                <span className="icon">
                    <i className="fas fa-save" />
                </span>
                <span onClick={this.downloadSvg}>Save as SVG</span>
            </span>
        )
    }

    /**
     * Downloads the provided SVG DOM element as an SVG file
     * @param {Object} svgElement - SVG DOM element
     * @param {string} filename - Name of the output file
     */
    downloadSvg = () => {
        console.log(this.props);
        const svgNode = document.getElementById(this.props.svgId).cloneNode(true);  // Deep clone of SVG DOM element

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
            navigator.msSaveBlob(blob, this.props.filename);
        } else {
            const link = document.createElement("a");
            if (link.download !== undefined) { // feature detection
                // Browsers that support HTML5 download attribute
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", this.props.filename);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }
}
