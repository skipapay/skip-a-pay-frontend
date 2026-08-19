import React from "react";
import PropTypes from "prop-types";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import "./icon-card.scss";

const IconCard = ({
  title,
  subtitle,
  smallTitle,
  icon: Icon,
  badgeText,
  variant = "primary",
  to,
  description,
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (to) {
      navigate(to);
    }
  };

  return (
    <div
      className={`modern-stat-card variant-${variant} ${to ? "is-clickable" : ""}`}
      onClick={handleCardClick}
      role={to ? "button" : undefined}
      tabIndex={to ? 0 : undefined}
      onKeyDown={(e) => {
        if (to && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          navigate(to);
        }
      }}
    >
      <div className="card-top-row">
        <div className="stat-icon-wrapper">
          {Icon && <Icon className="stat-icon" />}
        </div>
        {badgeText && <span className="stat-badge">{badgeText}</span>}
      </div>

      <div className="stat-content">
        <div className="stat-label-group">
          <span className="stat-title">{title}</span>
          {smallTitle && <span className="stat-small-title">{smallTitle}</span>}
        </div>

        {subtitle !== undefined && (
          <div className="stat-value-row">
            <span className="stat-value">{subtitle}</span>
          </div>
        )}

        {description && <p className="stat-description mb-0">{description}</p>}
      </div>

      {to && (
        <div className="card-action-footer">
          <span className="action-text">View Details</span>
          <ArrowRightIcon className="action-icon" />
        </div>
      )}

      {/* Decorative ambient background orb */}
      <div className="card-ambient-glow" />
    </div>
  );
};

IconCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  smallTitle: PropTypes.string,
  icon: PropTypes.elementType,
  badgeText: PropTypes.string,
  variant: PropTypes.oneOf(["primary", "blue", "purple", "emerald", "amber", "indigo"]),
  to: PropTypes.string,
  description: PropTypes.string,
};

export default IconCard;
