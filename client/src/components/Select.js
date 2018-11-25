import React from "react";
import PropTypes from 'prop-types';


export default class Select extends React.Component {
    static propTypes = {
        label: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired,
        options: PropTypes.objectOf(PropTypes.string).isRequired,
    };

    render() {
        const options = Object.keys(this.props.options).map(option => {
            return <option value={option} key={option}>{this.props.options[option]}</option>;
        });
        return (
            <div className="field">
                <label className="label is-small">{this.props.label}</label>
                <div className="control">
                    <div className="select is-fullwidth is-small">
                        <select value={this.props.options[this.props.value]}
                                onChange={this.props.onChange}>
                            {options}
                        </select>
                    </div>
                </div>
            </div>
        );
    }
}
