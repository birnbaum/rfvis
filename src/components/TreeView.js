import React from "react";
import DownloadButton from "./DownloadButton";
import Tree from "../containers/Tree";


export default function TreeView() {
    // TODO DownloadSVG
    return (
        <div id="content">
            <div className="TreeView">
                <Tree />
                <DownloadButton onClick={console.log("TODO")}/>
            </div>
        </div>
    )
}