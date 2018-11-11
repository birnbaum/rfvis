import { connect } from 'react-redux'
import { resetDisplayDepth, setDisplayDepth } from '../actions'
import InputWithButton from "../components/InputWithButton";

const mapStateToProps = (state, ownProps) => ({
    label: "Tree Depth",
    displayValue: state.displayDepth,
    minValue: 0,
    maxValue: state.maxDepth,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    inputOnChange: e => dispatch(setDisplayDepth(Number.parseInt(e.target.value, 10))),
    buttonOnClick: () => dispatch(resetDisplayDepth()),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(InputWithButton)