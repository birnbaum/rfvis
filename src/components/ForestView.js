import "./ForestView.scss"

import React from "react";
import DownloadButton from "./DownloadButton";

export default class ForestView extends React.Component {
    render() {
        return (
            <div className="ForestView">
                <svg className="Forest" />
                <DownloadButton />
            </div>
        );
    }
}