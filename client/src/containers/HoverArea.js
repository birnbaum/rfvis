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
                        <td>{this.props.currentTreeId + 1}</td>
                    </tr>
                    <tr>
                        <td>Error</td>
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
            <div>
                <label className="label is-small">Tree</label>
                <table className="table is-fullwidth is-narrow is-bordered is-striped">
                    <tbody>
                    <tr>
                        <td>ID</td>
                        <td>{this.props.tree.treeId}</td>
                    </tr>
                    <tr>
                        <td>Error</td>
                        <td>{this.props.tree.error}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}

export class BranchTable extends React.Component {
    static propTypes = {
        branch: PropTypes.any.isRequired,
    };

    render() {
        return (
            <div>
                <label className="label is-small">Branch</label>
                <table className="table is-fullwidth is-narrow is-bordered is-striped">
                    <tbody>
                    <tr>
                        <td>ID</td>
                        <td>{this.props.branch.id}</td>
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
                        <td>Number of Samples</td>
                        <td>{this.props.branch.n_node_samples}</td>
                    </tr>
                    </tbody>
                </table>
                <ClassDistributionTable classDistribution={this.props.branch.classDistribution} />
            </div>
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
                                <td>{this.props.leaf.id}</td>
                            </tr>
                            <tr>
                                <td>Depth</td>
                                <td>{this.props.leaf.depth}</td>
                            </tr>
                            <tr>
                                <td>Impurity</td>
                                <td>{Number.parseFloat(this.props.leaf.impurity.toFixed(5))}</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <ClassDistributionTable classDistribution={this.props.leaf.classDistribution} />
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
                <label className="label is-small">Consolidation Node</label>
                <table className="table is-fullwidth is-narrow is-bordered is-striped">
                    <tbody>
                    <tr>
                        <td>Depth</td>
                        <td>{this.props.bunch.baseNode.depth}</td>
                    </tr>
                    <tr>
                        <td>Samples</td>
                        <td>{this.props.bunch.n_node_samples}</td>
                    </tr>
                    </tbody>
                </table>
                <ClassDistributionTable classDistribution={this.props.bunch.classDistribution} />
            </div>
        )
    }
}


export class ClassDistributionTable extends React.Component {
    static propTypes = {
        classDistribution: PropTypes.any.isRequired
    };

    render() {
        const tableRows = this.props.classDistribution.map((cls, i) => {
            return (
                <tr key={i}>
                    <td>
                        <div className="class-distribution-table__color-patch"
                             style={{background: cls.color}} />
                    </td>
                    <td>{cls.name}</td>
                    <td>{cls.value}</td>
                </tr>
            );
        });

        return (
            <div>
                <label className="label is-small">Class Distribution</label>
                <table className="class-distribution-table table is-fullwidth is-narrow">
                    <tbody>
                        {tableRows}
                    </tbody>
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
        classHistogram: PropTypes.any,
    };

    render() {
        switch (this.props.hoverType) {
            case "TREE":
                return <TreeTable tree={this.props.hoverData} />;
            case "BRANCH":
                return <BranchTable branch={this.props.hoverData} />;
            case "LEAF":
                return <LeafTable leaf={this.props.hoverData} />;
            case "BUNCH":
                return <BunchTable bunch={this.props.hoverData.bunch}
                                   classHistogram={this.props.hoverData.histogram}/>;
            default:
                return <DefaultTable forest={this.props.forest}
                                     currentTreeId={this.props.currentTreeId} />;
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


