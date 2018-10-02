import "./TreeView.scss"

import React from "react";
import DownloadButton from "./DownloadButton";

export default class TreeView extends React.Component {
    render() {
        return (
            <div className="TreeView">
                <svg className="Tree" />
                <DownloadButton />
            </div>
        );
    }
}