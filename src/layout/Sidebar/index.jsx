import React from "react";
import "./sidebar.scss";
import Navigation from "./Navigation";
import Title from "./Title";
import { XMarkIcon } from "@heroicons/react/24/outline";

const Sidebar = ({ isOpenSidebar, handleSidebar }) => {
  return (
    <aside
      className={`sidebar ${isOpenSidebar ? "open" : "collapsed"}`}
    >
      <button
        type="button"
        className="btn toggle-btn"
        onClick={handleSidebar}
        title="Close Sidebar"
      >
        <XMarkIcon />
      </button>

      <div className="sidebar-header">
        <Title />
      </div>

      <nav className="sidebar-menu">
        <Navigation />
      </nav>
    </aside>
  );
};

export default Sidebar;
