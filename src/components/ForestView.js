import "./ForestView.css"

import React from "react";
import DownloadButton from "./DownloadButton";
import PropTypes from "prop-types";

export default class ForestView extends React.Component {
    render() {
        return (
            <div className="ForestView">
                <svg className="Forest" />
                <DownloadButton onClick={this.downloadSVG} />
            </div>
        );
    }

    downloadSVG = () => {  // TODO make utility class
        // TODO implement
    }
}

ForestView.propTypes = {

};