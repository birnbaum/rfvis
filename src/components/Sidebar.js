import React from "react";
import TreeNavigation from "../containers/TreeNavigation";
import ForestView from "./ForestView";
import HoverArea from "../containers/HoverArea";

export default function Sidebar() {
    return (
        <div className="Sidebar">
            <ForestView />
            <TreeNavigation />

            <div className="space" />

            <HoverArea />

        </div>
    );
}