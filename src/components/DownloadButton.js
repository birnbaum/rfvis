import "./DownloadButton.scss"

import React from "react";

export default class DownloadButton extends React.Component {
    render() {
        return (
            <span className="DownloadButton button is-small">
                <span className="icon">
                    <i className="fas fa-save" />
                </span>
                <span>Save as SVG</span>
            </span>
        )
    }
}