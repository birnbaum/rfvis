import React from "react";
import PropTypes from "prop-types";
import {Tab, Tabs, TabList, TabPanel} from "react-tabs";
import LeafColorSelect from '../containers/LeafColorSelect';
import BranchColorSelect from '../containers/BranchColorSelect';
import TreeDepthInput from '../containers/TreeDepthInput';
import TrunkLengthInput from '../containers/TrunkLengthInput';

export default class Menu extends React.Component {
    static propTypes = {
        title: PropTypes.string.isRequired,
    };

    render() {
        return (
            <div className="Menu">
                <div className="Menu-header">
                    <h3 className="Menu-title">rfvis</h3>
                    <h6 className="Menu-subtitle">{this.props.title}</h6>
                </div>

                <div className="Menu-content">

                    <div className="space" />

                    <TreeDepthInput />

                    <TrunkLengthInput />

                    <div className="space" />

                    <Tabs selectedTabClassName="is-active">
                        <div className="tabs">
                            <TabList>
                                <Tab><a>Color</a></Tab>
                                <Tab><a>Path</a></Tab>
                            </TabList>
                        </div>

                        <TabPanel>
                            <LeafColorSelect />
                            <BranchColorSelect />
                        </TabPanel>
                        <TabPanel>
                            <div className="field">
                                <label className="label is-small">Color Path to LeafID</label>
                                <div className="control">
                                    <input id="path-leaf-input" className="input is-small" type="number" min="0" step="1" />
                                </div>
                            </div>
                        </TabPanel>
                    </Tabs>

                </div>
            </div>
        );
    }
}