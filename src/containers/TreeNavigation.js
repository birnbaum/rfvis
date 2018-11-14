import React from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {decrementCurrentTreeId, incrementCurrentTreeId} from "../actions";

class TreeNavigation extends React.Component {
    static propTypes = {
        onClickPrevious: PropTypes.func.isRequired,
        onClickNext: PropTypes.func.isRequired,
    };

    render() {
        return (
            <div className="buttons has-addons">
                <span className="TreeNavigation-button button is-small"
                      onClick={this.props.onClickPrevious}>
                    <span className="icon">
                        <i className="fas fa-arrow-alt-circle-left" />
                    </span>
                    <span>Previous</span>
                </span>
                <span className="TreeNavigation-button button is-small"
                      onClick={this.props.onClickNext}>
                    <span>Next</span>
                    <span className="icon">
                        <i className="fas fa-arrow-alt-circle-right" />
                    </span>
                </span>
            </div>
        )
    }
}

const mapDispatchToProps = (dispatch, ownProps) => ({
    onClickPrevious: () => dispatch(decrementCurrentTreeId()),
    onClickNext: () => dispatch(incrementCurrentTreeId()),
});

export default connect(
    null,
    mapDispatchToProps
)(TreeNavigation)
