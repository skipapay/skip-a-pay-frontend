import React, { Suspense, lazy, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import config from "../config/config";
import Loader from "components/Loader";
import TopLoadingBar from "components/TopLoadingBar";

const Sidebar = lazy(() => import("./Sidebar"));

const Layout = () => {
  const isMobile = () => window.innerWidth <= config.hideSidebar;
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile());

  const applySidebarWidth = (open, mobile) => {
    const root = document.documentElement;
    if (mobile) {
      root.style.setProperty("--sidebar", "0px");
      if (open) {
        document.body.classList.add("sidebar-open");
      } else {
        document.body.classList.remove("sidebar-open");
      }
    } else {
      document.body.classList.remove("sidebar-open");
      root.style.setProperty("--sidebar", open ? "270px" : "80px");
    }
  };

  const handleSidebarToggle = () => {
    const mobile = isMobile();
    const nextState = !isSidebarOpen;
    setIsSidebarOpen(nextState);
    applySidebarWidth(nextState, mobile);
  };

  const handleResize = () => {
    const mobile = isMobile();
    if (mobile) {
      setIsSidebarOpen(false);
      applySidebarWidth(false, true);
    } else {
      setIsSidebarOpen(true);
      applySidebarWidth(true, false);
    }
  };

  useEffect(() => {
    const mobile = isMobile();
    applySidebarWidth(!mobile, mobile);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Suspense fallback={<Loader />}>
      {/* Top Loading Progress Bar across dashboard route navigation */}
      <TopLoadingBar />

      <div
        style={{
          paddingLeft: "var(--sidebar, 270px)",
          transition: "padding-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          minHeight: "100vh",
          backgroundColor: "#f8fafc",
        }}
      >
        <Sidebar handleSidebar={handleSidebarToggle} isOpenSidebar={isSidebarOpen} />
        <Header handleClick={handleSidebarToggle} />
        <main style={{ padding: "28px 24px" }}>
          <Suspense fallback={<TopLoadingBar isIndeterminate={true} />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </Suspense>
  );
};

export default Layout;
