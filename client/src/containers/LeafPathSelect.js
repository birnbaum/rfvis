import {connect} from 'react-redux'
import {setSelectedLeaf} from '../actions'
import {getLeafIds} from "../selectors";
import Select from '../components/Select'

const mapStateToProps = (state, ownProps) => ({
    label: "Color Path to LeafID",
    value: state.selectedLeaf,
    options: getLeafIds(state).reduce((acc, cur) => {
      acc[cur] = cur;
      return acc;
    }, {}),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    onChange: e => dispatch(setSelectedLeaf(Number.parseInt(e.target.value, 10))),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Select)