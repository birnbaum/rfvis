import React from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";


export class DefaultTable extends React.Component {
    static propTypes = {
        forest: PropTypes.any.isRequired,
        currentTreeId: PropTypes.number.isRequired,
    };

    render() {
        return (
            <div>
                <label className="label is-small">Forest</label>
                <table className="table is-fullwidth is-narrow is-bordered is-striped">
                    <tbody>
                    <tr>
                        <td>Error</td>
                        <td>{this.props.forest.error}</td>
                    </tr>
                    <tr>
                        <td>Number of Trees</td>
                        <td>{this.props.forest.trees.length}</td>
                    </tr>
                    <tr>
                        <td>Number of Samples</td>
                        <td>{this.props.forest.n_samples}</td>
                    </tr>
                    </tbody>
                </table>
                <label className="label is-small">Selected Tree</label>
                <table className="table is-fullwidth is-narrow is-bordered is-striped">
                    <tbody>
                    <tr>
                        <td>ID</td>
                        <td>#{this.props.currentTreeId + 1}</td>
                    </tr>
                    <tr>
                        <td>Out-of-bag Error</td>
                        <td>{this.props.forest.trees[this.props.currentTreeId].error}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}

export class TreeTable extends React.Component {
    static propTypes = {
        tree: PropTypes.any.isRequired,
    };

    render() {
        return (
            <table className="table is-fullwidth">
                <tbody>
                <tr>
                    <td style={{fontWeight: "bold"}}>Tree</td>
                    <td />
                </tr>
                <tr>
                    <td>Tree</td>
                    <td>#{this.props.tree.id}</td>
                </tr>
                <tr>
                    <td>Out-of-bag Error</td>
                    <td>{this.props.tree.error}</td>
                </tr>
                </tbody>
            </table>
        )
    }
}

export class BranchTable extends React.Component {
    static propTypes = {
        branch: PropTypes.any.isRequired,
    };

    render() {
        return (
            <table className="table is-fullwidth is-narrow is-bordered is-striped">
                <tbody>
                <tr>
                    <td style={{fontWeight: "bold"}}>Branch</td>
                    <td />
                </tr>
                <tr>
                    <td>Depth</td>
                    <td>{this.props.branch.depth}</td>
                </tr>
                <tr>
                    <td>Impurity</td>
                    <td>{this.props.branch.impurity}</td>
                </tr>
                <tr>
                    <td>Drop of Impurity</td>
                    <td>{this.props.branch.impurityDrop}</td>
                </tr>
                <tr>
                    <td>Number of Samples</td>
                    <td>{this.props.branch.samples}</td>
                </tr>
                </tbody>
            </table>
        )
    }
}

export class LeafTable extends React.Component {
    static propTypes = {
        leaf: PropTypes.any.isRequired,
    };

    render() {
        return (
            <div>
                <label className="label is-small">Leaf</label>
                <div className="leaf-info">
                    <div className="leaf-info__left">
                        <table className="leaf-info__table table is-fullwidth is-narrow is-bordered is-striped">
                            <tbody>
                            <tr>
                                <td>ID</td>
                                <td>#{this.props.leaf.leafId}</td>
                            </tr>
                            <tr>
                                <td>Depth</td>
                                <td>{this.props.leaf.depth}</td>
                            </tr>
                            <tr>
                                <td>Impurity</td>
                                <td>{this.props.leaf.impurity}</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                    {/*
                    <div className="leaf-info__right">
                        <div style="width: 80px; height: 80px; background: #eee;">
                            <img src="{window.location.origin}/patches/${leaf.leafId}.png">
                        </div>
                    </div>
                    */}
                </div>
                <div className="space" />
                <ClassDistributionTable classes={this.props.leaf.classes} />
            </div>
        );
    }
}

export class BunchTable extends React.Component {
    static propTypes = {
        bunch: PropTypes.any.isRequired,
        classHistogram: PropTypes.any.isRequired,
    };

    render() {
        return (
            <div>
                <table className="table is-fullwidth">
                    <tbody>
                    <tr>
                        <td style={{fontWeight: "bold"}}>Consolidation Node</td>
                        <td />
                    </tr>
                    <tr>
                        <td>Depth</td>
                        <td>{this.props.bunch.displayNode.depth}</td>
                    </tr>
                    <tr>
                        <td>Samples</td>
                        <td>{this.props.bunch.samples}</td>
                    </tr>
                    </tbody>
                </table>
                <div className="space" />
                <ClassDistributionTable classes={this.props.bunch.classes} />
            </div>
        )
    }
}


export class ClassDistributionTable extends React.Component {
    static propTypes = {
        classes: PropTypes.any.isRequired  // TODO improve prop type
    };

    render() {
        const tableRows = this.props.classes.map((cls, i) => {
            const patchStyle = {background: `rgb(${cls.color}`};
            return (
                <tr key={i}>
                    <td>
                        <div className="class-distribution-table__color-patch"
                             style={patchStyle} />
                    </td>
                    <td>{cls.name}</td>
                    <td>{cls.count}</td>
                </tr>
            );
        });

        return (
            <div>
                <label className="label is-small">Class Distribution</label>
                <table className="class-distribution-table table is-fullwidth is-narrow">
                    {tableRows}
                </table>
            </div>
        )
    }
}


class HoverArea extends React.Component {
    static propTypes = {
        hoverType: PropTypes.string,
        hoverData: PropTypes.any,
        forest: PropTypes.any.isRequired,
        currentTreeId: PropTypes.number.isRequired,
    };

    render() {
        switch (this.props.hoverType) {
            case "TREE":
                return <TreeTable tree={this.props.hoverData}/>;
            case "BRANCH":
                return <BranchTable branch={this.props.hoverData}/>;
            case "LEAF":
                return <LeafTable leaf={this.props.hoverData}/>;
            // case "BUNCH":
            //     return <BunchTable bunch={} classHistogram={}/>;
            default:
                return <DefaultTable forest={this.props.forest}
                                     currentTreeId={this.props.currentTreeId}/>;
        }
    }
}

const mapStateToProps = (state, ownProps) => ({
    hoverType: state.hoverType,
    hoverData: state.hoverData,
    forest: state.forest,
    currentTreeId: state.currentTreeId,
});

export default connect(
    mapStateToProps
)(HoverArea)


