import { connect } from 'react-redux'
import {setTrunkLength} from '../actions'
import Input from "../components/Input";

const mapStateToProps = (state, ownProps) => ({
    label: "Trunk Length",
    value: state.trunkLength,
    minValue: 10,
    maxValue: 500,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    onChange: e => dispatch(setTrunkLength(Number.parseInt(e.target.value, 10))),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Input)