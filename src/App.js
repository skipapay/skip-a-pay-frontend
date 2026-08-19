import React, { lazy } from "react";
import Layout from "layout";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "pages/Login";
import ApplyForm from "pages/Apply-Form";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "components/style/customToast.scss";
import AuthGuard from "util/AuthGuard";
import NotFound from "pages/404";

// Lazy-loaded Dashboard Area Pages for fast performance and route transitions
const Dashboard = lazy(() => import("pages/Dashboard"));
const SubmittedForm = lazy(() => import("pages/Submitted-Form"));
const TotalAccounts = lazy(() => import("pages/Total-Accounts"));
const Settings = lazy(() => import("pages/Settings"));

function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <AuthGuard>
              <Layout />
            </AuthGuard>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="/submitted-form" element={<SubmittedForm />} />
          <Route path="/total-accounts" element={<TotalAccounts />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        {/* Apply form route */}
        <Route path="/apply-cpfcu" element={<ApplyForm website={"cpfcu"} />} />
        <Route path="/apply-npcu" element={<ApplyForm website={"npcu"} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
