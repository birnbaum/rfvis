import "./ResetZoomButton.css"

import React from "react";
import PropTypes from "prop-types";

export default class ResetZoomButton extends React.Component {
    render() {
        return (
            <span className="ResetZoomButton button is-small">
                <span className="icon">
                    <i className="fas fa-undo" />
                </span>
                <span onClick={this.props.onClick}>Reset Zoom</span>
            </span>
        )
    }
}

ResetZoomButton.propTypes = {
    onClick: PropTypes.func.isRequired,
};