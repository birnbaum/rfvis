import React from "react";
import TreeNavigation from "../containers/TreeNavigation";
import ForestView from "./ForestView";

export default function Sidebar() {
    return (
        <div className="Sidebar">
            <ForestView />
            <TreeNavigation />

            <div className="space" />

            <div id="info">
                <div id="hover-info" />
            </div>

        </div>
    );
}