import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeftOnRectangleIcon,
  ArrowPathIcon,
  Bars3Icon,
  LockClosedIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { Stack } from "react-bootstrap";
import "./style.scss";
import { useDispatch, useSelector } from "react-redux";
import { logout, reset } from "features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import ChangePasswordModal from "components/ChangePasswordModal";
import UpdateUserModal from "components/UpdateUserModal";

const Header = ({ handleClick }) => {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const handleShowChangePasswordModal = () => {
    setIsDropdownOpen(false);
    setShowChangePassword(true);
  };
  const handleCloseChangePasswordModal = () => setShowChangePassword(false);

  const [showUpdateUserModal, setShowUpdateUserModal] = useState(false);
  const handleShowUpdateUserModal = () => {
    setIsDropdownOpen(false);
    setShowUpdateUserModal(true);
  };
  const handleCloseUpdateUserModal = () => setShowUpdateUserModal(false);

  // State-controlled profile dropdown with click-outside listener
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsDropdownOpen(false);
    dispatch(reset());
    dispatch(logout());
    navigate("/login");
  };

  const adminName = user?.name || "Administrator";
  const initials = adminName
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .toUpperCase() || "AD";

  return (
    <header className="top-navbar">
      <Stack direction="horizontal" gap={3} className="align-items-center">
        <button
          className="btn toggle-btn"
          onClick={handleClick}
          title="Toggle Navigation"
        >
          <Bars3Icon />
        </button>

        <div className="portal-header-badge d-none d-sm-flex">
          <span className="badge-dot" />
          <span>Skip A Pay Portal</span>
        </div>

        <div
          ref={profileRef}
          className={`ms-auto profile ${isDropdownOpen ? "is-open" : ""}`}
        >
          <div
            className="profile-trigger"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsDropdownOpen((prev) => !prev);
              }
            }}
          >
            <div className="profile-avatar-initials">{initials}</div>
            <span className="profile-name-text d-none d-md-inline">{adminName}</span>
            <ChevronDownIcon
              className="profile-chevron"
              style={{
                width: 14,
                height: 14,
                color: "#64748b",
                transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            />
          </div>

          <div className="profile-dropdown">
            <div className="dropdown-user-header">
              <div className="user-name-title">{adminName}</div>
              <div className="user-role-subtitle">{user?.email || "Super Admin"}</div>
            </div>

            <ul>
              <li onClick={handleShowUpdateUserModal}>
                <div className="auth-menu-row">
                  <ArrowPathIcon className="menu-icon" />
                  <span>Update Profile</span>
                </div>
              </li>
              <li onClick={handleShowChangePasswordModal}>
                <div className="auth-menu-row">
                  <LockClosedIcon className="menu-icon" />
                  <span>Security & Password</span>
                </div>
              </li>
              <hr style={{ margin: "4px 0", borderColor: "#f1f5f9" }} />
              <li className="logout-item" onClick={handleLogout}>
                <div className="auth-menu-row">
                  <ArrowLeftOnRectangleIcon className="menu-icon" />
                  <span>Log Out</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </Stack>

      {/* update name and email */}
      <UpdateUserModal
        show={showUpdateUserModal}
        handleClose={handleCloseUpdateUserModal}
      />
      {/* change password modal */}
      <ChangePasswordModal
        show={showChangePassword}
        handleClose={handleCloseChangePasswordModal}
      />
    </header>
  );
};

export default Header;
