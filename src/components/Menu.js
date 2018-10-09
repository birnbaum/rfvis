import "./Menu.css";

import React from "react";
import ColorSelect from "./ColorSelect";

export default class Menu extends React.Component {
    render() {
        return (
            <div className="Menu">
                <div className="Menu-header">
                    <h3 className="Menu-title">Random Forest Visualization</h3>
                    <h6 className="Menu-subtitle" />
                </div>

                <div className="Menu-content">
                    <div id="forest-info" />

                    <div className="space" />

                    <div className="field">
                        <label className="label is-small">Tree Depth</label>
                        <div className="field has-addons">
                            <div className="control is-expanded">
                                <input id="tree-depth" className="input is-small" type="number" min="1" max=""
                                       step="1" />
                            </div>
                            <div className="control">
                                <a id="reset-tree-depth" className="button is-small">
                                    MAX
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="field">
                        <label className="label is-small">Trunk Length</label>
                        <div className="control">
                            <input id="trunk-length" className="input is-small" type="number" min="10" max="500" step="10" />
                        </div>
                    </div>

                    <div className="space" />

                    <div className="tabs">
                        <ul>
                            <li id="color-tab" className="is-active"><a>Color</a></li>
                            <li id="path-tab"><a>Path</a></li>
                        </ul>
                    </div>

                    <div id="color-view">
                        <ColorSelect name="Branch Color" options={[
                            {value: "IMPURITY", name: "Impurity"},
                            {value: "DROP_OF_IMPURITY", name: "Drop of Impurity"},
                            {value: "BLACK", name: "Black"},
                        ]} />

                        <ColorSelect name="Leaf Color" options={[
                            {value: "IMPURITY", name: "Impurity"},
                            {value: "BEST_CLASS", name: "Best Class"},
                        ]} />
                    </div>

                    <div id="path-view">
                        <div className="field">
                            <label className="label is-small">Color Path to LeafID</label>
                            <div className="control">
                                <input id="path-leaf-input" className="input is-small" type="number" min="0" step="1" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}