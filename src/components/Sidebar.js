import "./Sidebar.css";

import React from "react";
import ForestView from "./ForestView";
import ResetZoomButton from "./ResetZoomButton";
import PropTypes from 'prop-types';

export default class Sidebar extends React.Component {

    render() {
        return (
            <div className="Sidebar">
                <ForestView />

                <div className="buttons has-addons">
                    <span className="Sidebar-treeSwitchButton button is-small"
                          onClick={this.props.previousTree}>
                        <span className="icon">
                            <i className="fas fa-arrow-alt-circle-left" />
                        </span>
                        <span>Previous</span>
                    </span>
                    <span className="Sidebar-treeSwitchButton button is-small"
                          onClick={this.props.nextTree}>
                        <span>Next</span>
                        <span className="icon">
                            <i className="fas fa-arrow-alt-circle-right" />
                        </span>
                    </span>
                </div>

                <div className="space" />

                <div id="info">
                    <div id="hover-info" />
                </div>

                <div className="space" />

                <ResetZoomButton />

                <div className="space" />

            </div>
        );
    }
}

Sidebar.propTypes = {
    nextTree: PropTypes.func.isRequired,
    previousTree: PropTypes.func.isRequired,
};