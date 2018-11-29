import os
from setuptools import setup
from rfvis import __version__

here = os.path.abspath(os.path.dirname(__file__))
with open(os.path.join(here, "README.md"), encoding="utf-8") as f:
    long_description = "\n" + f.read()


if __name__ == "__main__":
    setup(
        name="rfvis",
        version=__version__,
        author="Philipp Wiesner",
        author_email="wiesnerph@gmail.com",
        description="A tool for visualizing the structure and performance of Random Forests",
        long_description=long_description,
        long_description_content_type="text/markdown",
        keywords=[
            "random-forest",
            "visualization",
            "decision-trees",
            "d3js",
            "react",
        ],
        url="https://github.com/birnbaum/rfvis",
        project_urls={
            "Bug Tracker": "https://github.com/birnbaum/rfvis/issues",
        },
        packages=["rfvis"],
        license="ISC",
        # python_requires=">=3.5",
        install_requires=[
            "click",
            "flask",
        ],
        entry_points={
            "console_scripts": [
                "rfvis = rfvis.__main__:main",
            ]
        },
        classifiers=[
            "TODO"
        ],
    )
