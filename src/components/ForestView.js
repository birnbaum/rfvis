import React from "react";
import DownloadButton from "./DownloadButton";
import Forest from "../containers/Forest";

export default function ForestView() {
    return (
        <div className="ForestView">
            <Forest />
            <DownloadButton onClick={console.log("TODO")}/>  // TODO DownloadSVG
        </div>
    )
}