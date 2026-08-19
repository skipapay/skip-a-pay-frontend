import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const NavItem = ({ item }) => {
  const location = useLocation();
  const [isActive, setIsActive] = useState(false);
  const Icon = item.icon;
  const navigate = useNavigate();

  useEffect(() => {
    let currentUrl = location.pathname;
    // remove trailing slash if needed
    if (currentUrl.endsWith("/") && currentUrl.length > 1) {
      const newPath = currentUrl.slice(0, -1);
      currentUrl = newPath;
      navigate(newPath, { replace: true });
    }
    setIsActive(currentUrl === item.url);
  }, [location, item.url, navigate]);

  return (
    <Link to={item.url} title={item.title} className="sidebar-link-wrapper">
      <div className={`sidebar-item ${isActive ? "active" : ""}`}>
        <span className="sidebar-icon">
          <Icon />
        </span>
        <span className="sidebar-title">{item.title}</span>
      </div>
    </Link>
  );
};

NavItem.propTypes = {
  item: PropTypes.object.isRequired,
};

export default NavItem;
