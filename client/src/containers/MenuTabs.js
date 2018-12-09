import React from "react";
import {connect} from 'react-redux'
import {setColorTabIndex} from '../actions'
import PropTypes from "prop-types";
import {Tab, TabList, TabPanel, Tabs} from "react-tabs";
import PathInput from "./LeafPathSelect";
import LeafColorSelect from '../containers/LeafColorSelect';
import BranchColorSelect from '../containers/BranchColorSelect';

class MenuTabs extends React.Component {
    static propTypes = {
        colorTabIndex: PropTypes.number.isRequired,
        changeColorTabIndex: PropTypes.func.isRequired,
    };

    render() {
        return (
            <Tabs selectedIndex={this.props.colorTabIndex}
                  onSelect={this.props.changeColorTabIndex}
                  selectedTabClassName="is-active">
                <div className="tabs">
                    <TabList>
                        <Tab><a>Color</a></Tab>
                        <Tab><a>Path</a></Tab>
                    </TabList>
                </div>

                <TabPanel>
                    <LeafColorSelect />
                    <BranchColorSelect />
                </TabPanel>

                <TabPanel>
                    <PathInput />
                </TabPanel>
            </Tabs>
        );
    }
}

const mapStateToProps = (state, ownProps) => ({
    colorTabIndex: state.colorTabIndex,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    changeColorTabIndex: newIndex => dispatch(setColorTabIndex(newIndex)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MenuTabs)