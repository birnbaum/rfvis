import os
import string
import numpy as np
from sklearn.ensemble.forest import _generate_unsampled_indices
from sklearn.tree.tree import DTYPE
from sklearn.utils import check_array

__version__ = "0.2.1"

DEFAULT_COLORS = [
    "#1f77b4",
    "#ff7f0e",
    "#2ca02c",
    "#d62728",
    "#9467bd",
    "#8c564b",
    "#e377c2",
    "#7f7f7f",
    "#bcbd22",
    "#17becf",
]


def gui(model, data=None, target=None, name=None, class_names=None, class_colors=None, port=8080):
    """Starts a RFVis server for visualizing a scikit-learn RandomForestClassifier instance

    The server will be available at 127.0.0.1:<port>.

    Args:
        model (sklearn.ensemble.RandomForestClassifier): The model to visualize.
        data (array-like, shape=(n_samples, n_features)): The training input samples that were used to fit the model.
            Used to compute the out-of-bag error and correlation of the individual trees.
            If not provided, the forest view will have no significance.
        target (array-like, shape=n_samples): The target values (class labels) that were used to fit the model.
            Used to compute the out-of-bag error and correlation of the individual trees.
            If not provided, the forest view will have no significance.
        name (str): Optional name of the model which will be displayed in the frontend.
        class_names (List[str]): Optional list of names of the target classes
        class_colors (List[str]): Optional list of browser interpretable colors for the target classes.
            See https://developer.mozilla.org/en-US/docs/Web/CSS/color_value.
        port (int): Port on which the frontend will run on. Defaults to 8080.
    """
    data = check_array(data, dtype=DTYPE, accept_sparse="csr")
    if len(target.shape) == 2:
        target = target[0]

    error = 1 - model.oob_score_ if hasattr(model, "oob_score_") else None
    n_samples = int(model.estimators_[0].tree_.n_node_samples[0])

    if class_names is None:
        class_names = list(string.ascii_uppercase[:model.n_classes_])

    if class_colors is None:
        class_colors = [DEFAULT_COLORS[i % len(DEFAULT_COLORS)] for i in range(model.n_classes_)]

    classes = [{"name": name, "color": color} for name, color in zip(class_names, class_colors)]

    preds_and_indices = _oob_predictions_and_indices(model.estimators_, data)
    oob_scores = [np.mean(target[oob_indices] == predictions, axis=0) for predictions, oob_indices in preds_and_indices]
    correlation_matrix = _correlation_matrix(preds_and_indices)
    trees = _trees(model.estimators_, oob_scores)

    _start_server({
        "name": name,
        "error": error,
        "n_samples": n_samples,
        "correlationMatrix": correlation_matrix,
        "classes": classes,
        "trees": trees
    }, port)


def _start_server(data, port=8080, debug=False, use_reloader=False, **kwargs):
    """Starts a web server that serves the RFVis frontend"""
    from flask import Flask, send_from_directory, jsonify
    app = Flask(__name__, static_folder="client/build")

    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_app(path):
        build_path = os.path.join(os.path.dirname(__file__), "client", "build")
        if path != "" and os.path.exists(os.path.join(build_path, path)):
            return send_from_directory(build_path, path)
        else:
            return send_from_directory(build_path, "index.html")

    @app.route("/data")
    def serve_data():
        return jsonify(data)

    os.environ["WERKZEUG_RUN_MAIN"] = "true"
    app.run(port=port, debug=debug, use_reloader=use_reloader, **kwargs)


def _oob_predictions_and_indices(estimators, data):
    """Computes the out-of-bag indices and their prediction result for each provided estimator.

    Args:
        estimators (List[sklearn.tree.DecisionTreeClassifier]): Estimators of the ensemble model.
        data (array-like, shape=(n_samples, n_features)): The training input samples that were used to fit the model.

    Returns:
        List[Tuple[np.array, np.array]]: A tuple of out-of-bag indices and predictions for each provided estimator.
    """
    n_samples = data.shape[0]
    oob_predictions_and_indices = []
    for estimator in estimators:
        indices = _generate_unsampled_indices(estimator.random_state, n_samples)
        predictions = np.zeros(n_samples)
        predictions[indices] = estimator.predict(data[indices, :])
        oob_predictions_and_indices.append((predictions, indices))
    return oob_predictions_and_indices


def _correlation_matrix(oob_predictions_and_indices):
    """Computes the correlation between the single estimators of the ensemble model.

    Args:
        oob_predictions_and_indices (List[Tuple[np.array, np.array]]): Out-of-bag indices and predictions for each
            estimator of the ensemble model.

    Returns:
        np.array, shape=(n_estimators, n_estimators): Correlation matrix of the estimators of the ensemble model.
    """
    correlation_matrix = []
    for i in oob_predictions_and_indices:
        for j in oob_predictions_and_indices:
            intersecting_indices = np.intersect1d(i[1], j[1])
            intersecting_predictions_i = i[0][intersecting_indices]
            intersecting_predictions_j = j[0][intersecting_indices]
            correlation_matrix.append(np.corrcoef(intersecting_predictions_i, intersecting_predictions_j)[0][1])
    dimension = len(oob_predictions_and_indices)
    correlation_matrix = np.reshape(correlation_matrix, (dimension, dimension)).tolist()
    return correlation_matrix


def _trees(estimators, oob_scores):
    """Generates the tree data structure that is expected by the RFVis frontend.

    Args:
        estimators (List[sklearn.tree.DecisionTreeClassifier]): Estimators of the ensemble model.
        oob_scores (np.array, shape=n_estimators): Out-of-bag score for each estimator.

    Returns:
        List[Dict]: List of decision tree estimators where each dictionary has the keys
            - error (float): The out-of-bag error
            - data (str): Tree nodes in CSV format as required by the frontend
    """
    trees = []
    for estimator, oob_score in zip(estimators, oob_scores):
        n_nodes = estimator.tree_.node_count
        children_left = estimator.tree_.children_left
        children_right = estimator.tree_.children_right

        # The tree structure can be traversed to compute various properties such
        # as the depth of each node and whether or not it is a leaf.
        node_depth = np.zeros(shape=n_nodes, dtype=np.int64)
        stack = [(0, -1)]  # seed is the root node id and its parent depth
        while len(stack) > 0:
            node_id, parent_depth = stack.pop()
            node_depth[node_id] = parent_depth + 1
            if children_left[node_id] != children_right[node_id]:
                stack.append((children_left[node_id], parent_depth + 1))
                stack.append((children_right[node_id], parent_depth + 1))

        csv_lines = ["id,depth,n_node_samples,impurity,value"]

        # feature, threshold, drop-of-impurity, ...
        for i in range(n_nodes):
            value = [str(int(v)) for v in estimator.tree_.value[i][0]]
            els = [i,
                   node_depth[i],
                   estimator.tree_.n_node_samples[i],
                   estimator.tree_.impurity[i],
                   "\"[{}]\"".format(",".join(value))]
            csv_lines.append(",".join([str(el) for el in els]))
        trees.append({
            "error": 1 - oob_score,
            "data": "\n".join(csv_lines)
        })
    return trees
