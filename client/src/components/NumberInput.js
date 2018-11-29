import React from "react";
import PropTypes from 'prop-types';


export default class NumberInput extends React.Component {
    static propTypes = {
        label: PropTypes.string.isRequired,
        value: PropTypes.number.isRequired,
        min: PropTypes.number,
        max: PropTypes.number,
        step: PropTypes.number,
        onChange: PropTypes.func.isRequired,
    };

    render() {
        return (
            <div className="field">
                <label className="label is-small">{this.props.label}</label>
                <div className="control">
                    <input className="input is-small"
                           value={this.props.value}
                           onChange={this.props.onChange}
                           type="number"
                           min={this.props.min}
                           max={this.props.max}
                           step={this.props.step} />
                </div>
            </div>
        );
    }
}
