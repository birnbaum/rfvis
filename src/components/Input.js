import React from "react";
import PropTypes from 'prop-types';


export default class Input extends React.Component {
    static propTypes = {
        label: PropTypes.string.isRequired,
        displayValue: PropTypes.string.isRequired,
        minValue: PropTypes.string,
        maxValue: PropTypes.string,
        onChange: PropTypes.func.isRequired,
    };

    render() {
        return (
            <div className="field">
                <label className="label is-small">{this.props.label}</label>
                <div className="control">
                    <input id="trunk-length"
                           className="input is-small"
                           value={this.props.displayValue}
                           onChange={this.props.onChange}
                           type="number"
                           min={this.props.minValue}
                           max={this.props.maxValue}
                           step="10" />
                </div>
            </div>
        );
    }
}
