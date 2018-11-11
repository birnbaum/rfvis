import { connect } from 'react-redux'
import { setBranchColor } from '../actions'
import Select from '../components/Select'
import {BRANCH_COLORS} from "../constants";

const mapStateToProps = (state, ownProps) => ({
    label: "Branch Color",
    value: state.branchColor,
    options: BRANCH_COLORS,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    onChange: e => dispatch(setBranchColor(BRANCH_COLORS[e.target.value]))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Select)