import React from "react";
import PropTypes from 'prop-types';


export default class InputWithButton extends React.Component {
    static propTypes = {
        label: PropTypes.string.isRequired,
        displayValue: PropTypes.string.isRequired,
        minValue: PropTypes.string,
        maxValue: PropTypes.string,
        inputOnChange: PropTypes.func.isRequired,
        buttonOnClick: PropTypes.func.isRequired,
    };

    render() {
        return (
            <div className="field">
                <label className="label is-small">{this.props.label}</label>
                <div className="field has-addons">
                    <div className="control is-expanded">
                        <input className="input is-small"
                               type="number"
                               value={this.props.displayValue}
                               onChange={this.props.inputOnChange}
                               min={this.props.minValue}
                               max={this.props.maxValue}
                               step="1" />
                    </div>
                    <div className="control">
                        <a className="button is-small"
                           onClick={this.props.buttonOnClick}>
                            MAX
                        </a>
                    </div>
                </div>
            </div>
        );
    }
}
