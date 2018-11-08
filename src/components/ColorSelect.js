import React from "react";

export default class ColorSelect extends React.Component {
    render() {
        const options = this.props.options.map(option => {
            return <option value={option.value} key={option.value}>{option.name}</option>;
        });
        return (
            <div className="field">
                <label className="label is-small">{this.props.name}</label>
                <div className="control">
                    <div className="select is-fullwidth is-small">
                        <select id="leaf-color-select"
                                value={this.props.value}
                                onChange={this.props.onChange}>
                            {options}
                        </select>
                    </div>
                </div>
            </div>
        );
    }
}
