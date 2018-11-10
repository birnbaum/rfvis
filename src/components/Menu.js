import React from "react";
import ColorSelect from "./ColorSelect";
import PropTypes from "prop-types";
import {Tab, Tabs, TabList, TabPanel} from "react-tabs";


export default class Menu extends React.Component {
    render() {
        return (
            <div className="Menu">
                <div className="Menu-header">
                    <h3 className="Menu-title">rfvis</h3>
                    <h6 className="Menu-subtitle">{this.props.title}</h6>
                </div>

                <div className="Menu-content">
                    <div id="forest-info" />

                    <div className="space" />

                    <div className="field">
                        <label className="label is-small">Tree Depth</label>
                        <div className="field has-addons">
                            <div className="control is-expanded">
                                <input id="tree-depth"
                                       className="input is-small"
                                       type="number"
                                       value={this.props.displayDepth}
                                       onChange={this.props.changeDepth}
                                       min="1"
                                       max={this.props.maxDepth}
                                       step="1" />
                            </div>
                            <div className="control">
                                <a id="reset-tree-depth"
                                   className="button is-small"
                                   onClick={this.props.resetDepth}>
                                    MAX
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="field">
                        <label className="label is-small">Trunk Length</label>
                        <div className="control">
                            <input id="trunk-length"
                                   className="input is-small"
                                   value={this.props.trunkLength}
                                   onChange={this.props.changeTrunkLength}
                                   type="number"
                                   min="10"
                                   max="500"
                                   step="10" />
                        </div>
                    </div>

                    <div className="space" />

                    <Tabs selectedTabClassName="is-active">
                        <div className="tabs">
                            <TabList>
                                <Tab><a>Color</a></Tab>
                                <Tab><a>Path</a></Tab>
                            </TabList>
                        </div>

                        <TabPanel>
                            <ColorSelect name="Branch Color"
                                         options={[
                                             {value: "IMPURITY", name: "Impurity"},
                                             {value: "DROP_OF_IMPURITY", name: "Drop of Impurity"},
                                             {value: "BLACK", name: "Black"},
                                         ]}
                                         value={this.props.branchColor}
                                         onChange={this.props.changeBranchColor} />

                            <ColorSelect name="Leaf Color"
                                         options={[
                                             {value: "IMPURITY", name: "Impurity"},
                                             {value: "BEST_CLASS", name: "Best Class"},
                                         ]}
                                         value={this.props.leafColor}
                                         onChange={this.props.changeLeafColor} />
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

Menu.propTypes = {
    title: PropTypes.string.isRequired,
    maxDepth: PropTypes.number.isRequired,
    displayDepth: PropTypes.number.isRequired,
    changeDepth: PropTypes.func.isRequired,
    resetDepth: PropTypes.func.isRequired,
    trunkLength: PropTypes.number.isRequired,
    changeTrunkLength: PropTypes.func.isRequired,
    branchColor: PropTypes.string.isRequired,
    changeBranchColor: PropTypes.func.isRequired,
    leafColor: PropTypes.string.isRequired,
    changeLeafColor: PropTypes.func.isRequired,
};