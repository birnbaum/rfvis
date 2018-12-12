import React from "react";
import TreeNavigation from "../containers/TreeNavigation";
import ForestView from "../containers/ForestView";
import HoverArea from "../containers/HoverArea";

export default function Sidebar() {
    return (
        <div className="Sidebar">
            <ForestView />
            <TreeNavigation />
            <HoverArea />
        </div>
    );
}