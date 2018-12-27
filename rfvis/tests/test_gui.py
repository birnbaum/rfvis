import requests

from examples.scikit_learn import main


def test_example_script():
    process = main()
    response = requests.get("http://localhost:8080")
    assert response.status_code == 200
    assert b"RFVis" in response.content
    process.terminate()
