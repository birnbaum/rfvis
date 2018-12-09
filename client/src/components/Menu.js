import React from "react";
import PropTypes from "prop-types";
import TreeDepthInput from '../containers/TreeDepthInput';
import TrunkLengthInput from '../containers/TrunkLengthInput';
import MenuTabs from "../containers/MenuTabs";

export default class Menu extends React.Component {
    static propTypes = {
        title: PropTypes.string.isRequired,
    };

    render() {
        return (
            <div className="Menu">
                <div className="Menu-header">
                    <h3 className="Menu-title">RFVis</h3>
                    <h6 className="Menu-subtitle">{this.props.title}</h6>
                </div>

                <div className="Menu-content">
                    <TreeDepthInput />
                    <TrunkLengthInput />
                    <MenuTabs />
                </div>
            </div>
        );
    }
}