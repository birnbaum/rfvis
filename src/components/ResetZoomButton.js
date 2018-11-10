import PropTypes from "prop-types";
import React from "react";

const ResetZoomButton = (props) => (
    <span className="ResetZoomButton button is-small">
        <span className="icon">
            <i className="fas fa-undo" />
        </span>
        <span onClick={props.onClick}>Reset Zoom</span>
    </span>
);

ResetZoomButton.propTypes = {
    onClick: PropTypes.func.isRequired,
};