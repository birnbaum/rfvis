import React from "react";
import PropTypes from 'prop-types';


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

ColorSelect.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
            value: PropTypes.string.isRequired
        })
    ).isRequired,
};