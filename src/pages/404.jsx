import React from "react";
import { Link } from "react-router-dom";
import {
  ExclamationTriangleIcon,
  HomeIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import "./404.scss";

const NotFound = () => {
  return (
    <div className="notfound-page-wrapper">
      <div className="notfound-card">
        <div className="error-code-badge">
          <ExclamationTriangleIcon className="error-icon" />
        </div>

        <div className="error-number">404</div>
        <h1 className="notfound-title">Page Not Found</h1>
        <p className="notfound-desc">
          The page or portal link you are looking for doesn't exist, has been removed, or is temporarily unavailable.
        </p>

        <div className="notfound-actions">
          <Link to="/" className="btn-action-primary">
            <HomeIcon className="btn-icon" />
            <span>Go to Dashboard</span>
          </Link>
          <Link to="/apply-cpfcu" className="btn-action-secondary">
            <span>Apply Portal</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
