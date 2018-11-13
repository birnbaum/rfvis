import React from "react";
import PropTypes from "prop-types";

export default class DownloadButton extends React.Component {
    static propTypes = {
        onClick: PropTypes.func.isRequired,
    };

    render() {
        return (
            <span className="DownloadButton button is-small">
                <span className="icon">
                    <i className="fas fa-save" />
                </span>
                <span onClick={this.props.onClick}>Save as SVG</span>
            </span>
        )
    }
}