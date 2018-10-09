import "./ResetZoomButton.css"

import React from "react";

export default class ResetZoomButton extends React.Component {
    render() {
        return (
            <span className="ResetZoomButton button is-small">
                <span className="icon">
                    <i className="fas fa-undo" />
                </span>
                <span>Reset Zoom</span>
            </span>
        )
    }
}