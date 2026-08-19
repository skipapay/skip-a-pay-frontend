import React from "react";
import PropTypes from "prop-types";
import "./style/ModalComponent1.scss";

export default function ModalComponent1({ icon: Icon, title, subtitle, badge }) {
  return (
    <div className="modal-info-item">
      {Icon && (
        <div className="info-icon-wrapper">
          <Icon className="info-icon" />
        </div>
      )}
      <div className="info-content">
        <span className="info-title">{title}</span>
        <span className="info-subtitle" title={subtitle}>
          {subtitle || "—"}
        </span>
        {badge && <span className="info-badge">{badge}</span>}
      </div>
    </div>
  );
}

ModalComponent1.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  badge: PropTypes.string,
};