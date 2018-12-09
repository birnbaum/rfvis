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
        author_email="mail@philippwiesner.com",
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
        license="MIT",
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
            "Development Status :: 4 - Beta",
            "Environment :: Console",
            "Environment :: Web Environment",
            "Intended Audience :: Education",
            "Intended Audience :: Science/Research",
            "License :: OSI Approved :: MIT License",
            "Operating System :: OS Independent",
            "Programming Language :: JavaScript",
            "Programming Language :: Python",
            "Programming Language :: Python :: 2",
            "Programming Language :: Python :: 2.7",
            "Programming Language :: Python :: 3",
            "Programming Language :: Python :: 3.4",
            "Programming Language :: Python :: 3.5",
            "Programming Language :: Python :: 3.6",
            "Programming Language :: Python :: 3.7",
            "Topic :: Education",
            "Topic :: Scientific/Engineering :: Visualization",
        ],
    )
