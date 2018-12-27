from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import make_classification
from rfvis import gui


def main():
    # Create an example dataset
    X, y = make_classification(n_samples=20000,
                               n_classes=3,
                               n_features=4,
                               n_informative=3,
                               n_redundant=1,
                               flip_y=0.05)

    # Create and fit the model
    model = RandomForestClassifier(n_estimators=20, oob_score=True)
    model.fit(X, y)

    # Start the RFVis GUI
    return gui(model, X, y)


if __name__ == "__main__":
    main()
