import { connect } from 'react-redux'
import { resetDisplayDepth, setDisplayDepth } from '../actions'
import { getMaxDepth } from '../selectors';
import PropTypes from "prop-types";
import React from "react";

class TreeDepthInput extends React.Component {
    static propTypes = {
        label: PropTypes.string.isRequired,
        value: PropTypes.number.isRequired,
        minValue: PropTypes.number,
        maxValue: PropTypes.number,
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
                               value={this.props.value}
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

const mapStateToProps = (state, ownProps) => ({
    label: "Tree Depth",
    value: state.displayDepth,
    minValue: 0,
    maxValue: getMaxDepth(state),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    inputOnChange: e => dispatch(setDisplayDepth(Number.parseInt(e.target.value, 10))),
    buttonOnClick: () => dispatch(resetDisplayDepth()),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TreeDepthInput)