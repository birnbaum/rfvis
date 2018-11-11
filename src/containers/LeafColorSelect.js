import { connect } from 'react-redux'
import {setLeafColor} from '../actions'
import Select from '../components/Select'
import {LEAF_COLORS} from "../constants";

const mapStateToProps = (state, ownProps) => ({
    label: "Leaf Color",
    value: state.leafColor,
    options: LEAF_COLORS,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    onChange: e => dispatch(setLeafColor(LEAF_COLORS[e.target.value]))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Select)