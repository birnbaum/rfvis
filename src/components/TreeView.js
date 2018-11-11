import React from "react";
import DownloadButton from "./DownloadButton";
import ResetZoomButton from "./ResetZoomButton";
import Tree from "../containers/Tree";


export default function TreeView() {
    return (
        <div id="content">
            <div className="TreeView">
                <Tree />
                <DownloadButton onClick={console.log("TODO")}/>  // TODO DownloadSVG
                <ResetZoomButton onClick={this.props.resetTree} />
            </div>
        </div>
    )
}