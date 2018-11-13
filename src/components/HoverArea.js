import React from "react";
import PropTypes from "prop-types";

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
                        <td>{this.props.forest.totalSamples}</td>
                    </tr>
                </table>
                <label className="label is-small">Selected Tree</label>
                <table className="table is-fullwidth is-narrow is-bordered is-striped">
                    <tr>
                        <td>ID</td>
                        <td>#{this.props.currentTreeId + 1}</td>
                    </tr>
                    <tr>
                        <td>Out-of-bag Error</td>
                        <td>{this.props.forest.trees[this.props.currentTreeId].oobError}</td>
                    </tr>
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
                    <td>{this.props.tree.oobError}</td>
                </tr>
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
                <tr>
                    <td style="font-weight: bold">Branch</td>
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
                    <tr>
                        <td style="font-weight: bold">Consolidation Node</td>
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
        const tableRows = this.props.leaf.classes.map((cls, i) => {
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