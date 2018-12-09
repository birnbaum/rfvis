import { connect } from 'react-redux'
import {setTrunkLength} from '../actions'
import NumberInput from "../components/NumberInput";

const mapStateToProps = (state, ownProps) => ({
    label: "Trunk Length",
    value: state.trunkLength,
    min: 10,
    max: 500,
    step: 10,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    onChange: e => dispatch(setTrunkLength(Number.parseInt(e.target.value, 10))),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NumberInput)