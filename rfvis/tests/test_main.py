import os
import tarfile

import pytest

from rfvis.__main__ import _read_data


@pytest.fixture(params=["dir", "tar", "json"])
def forest_data(request, tmp_path):
    forest_dir = os.path.join(os.path.dirname(__file__), "resources")
    if request.param == "dir":
        return forest_dir
    forest_json = os.path.join(forest_dir, "forest.json")
    if request.param == "json":
        return forest_json
    forest_tar = os.path.join(tmp_path, "forest.tar.gz")
    with tarfile.open(forest_tar, mode="w:gz") as tar:
        for p in os.listdir(forest_dir):
            tar.add(os.path.join(forest_dir, p), arcname=p)
    if request.param == "tar":
        return forest_tar
    raise ValueError("Unknown parameter {}".format(request.param))


def test_read_data(forest_data):
    forest = _read_data(forest_data)
    assert len(forest["trees"]) == 2
    assert forest["trees"][0]["error"] == 0.278413
