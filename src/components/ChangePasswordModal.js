import React, { useState } from "react";
import PropTypes from "prop-types";
import { Modal, Button, Form, Row, Col, Spinner } from "react-bootstrap";
import updatePassword from "api/admin/updatePassword";
import { useFormik } from "formik";
import * as yup from "yup";
import { toast } from "react-toastify";
import {
  LockClosedIcon,
  KeyIcon,
  CheckIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

const ChangePasswordModal = ({ show, handleClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const schema = yup.object().shape({
    oldPassword: yup.string().required("Current password is required"),
    password: yup
      .string()
      .required("New password is required")
      .min(7, "Password must be at least 7 characters"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password"), null], "Passwords do not match")
      .required("Confirm your new password"),
  });

  const formik = useFormik({
    initialValues: {
      oldPassword: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: schema,
    onSubmit: async (values, { resetForm }) => {
      try {
        setIsSubmitting(true);
        const response = await updatePassword(values);

        if (response.status === 201 || response.status === 200) {
          toast.success("Password changed successfully!");
          resetForm();
          handleClose();
        } else {
          toast.error(response.message || "Failed to update password. Please check your current password.");
        }
      } catch (err) {
        toast.error(err?.message || "An unexpected error occurred.");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const { errors, touched, handleSubmit, handleChange, values } = formik;

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      backdrop="static"
      keyboard={false}
      className="custom-skip-modal"
    >
      <Modal.Header closeButton className="modal-header-custom">
        <div className="d-flex align-items-center gap-3">
          <div className="header-icon-badge" style={{ background: "linear-gradient(135deg, #ede9fe 0%, #dbeafe 100%)", color: "#4d17bd" }}>
            <KeyIcon className="header-icon" />
          </div>
          <div>
            <Modal.Title id="change-password-title" className="modal-title-text">
              Change Security Password
            </Modal.Title>
            <p className="modal-subtitle-text mb-0">
              Update your account password with at least 7 characters
            </p>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="modal-body-custom">
        <Form noValidate onSubmit={handleSubmit}>
          <Row className="g-3">
            {/* Old Password */}
            <Col xs={12}>
              <Form.Group controlId="controlId-oldPassword" className="form-group-custom">
                <Form.Label className="input-label-custom">
                  Current Password <span className="text-danger">*</span>
                </Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type={showOldPassword ? "text" : "password"}
                    name="oldPassword"
                    value={values.oldPassword}
                    onChange={handleChange}
                    isInvalid={touched.oldPassword && !!errors.oldPassword}
                    isValid={touched.oldPassword && !errors.oldPassword}
                    placeholder="Enter current password"
                    className="form-control-custom shadow-none"
                    style={{ paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    className="btn position-absolute top-50 end-0 translate-middle-y me-2 p-1 border-0 text-muted"
                    onClick={() => setShowOldPassword((prev) => !prev)}
                    title={showOldPassword ? "Hide password" : "Show password"}
                  >
                    {showOldPassword ? (
                      <EyeSlashIcon style={{ width: 18, height: 18 }} />
                    ) : (
                      <EyeIcon style={{ width: 18, height: 18 }} />
                    )}
                  </button>
                  <Form.Control.Feedback type="invalid">
                    {errors.oldPassword}
                  </Form.Control.Feedback>
                </div>
              </Form.Group>
            </Col>

            {/* New Password */}
            <Col xs={12}>
              <Form.Group controlId="controlId-newPassword" className="form-group-custom">
                <Form.Label className="input-label-custom">
                  New Password <span className="text-danger">*</span>
                </Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type={showNewPassword ? "text" : "password"}
                    name="password"
                    value={values.password}
                    onChange={handleChange}
                    isInvalid={touched.password && !!errors.password}
                    isValid={touched.password && !errors.password}
                    placeholder="Enter new password (min. 7 chars)"
                    className="form-control-custom shadow-none"
                    style={{ paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    className="btn position-absolute top-50 end-0 translate-middle-y me-2 p-1 border-0 text-muted"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    title={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? (
                      <EyeSlashIcon style={{ width: 18, height: 18 }} />
                    ) : (
                      <EyeIcon style={{ width: 18, height: 18 }} />
                    )}
                  </button>
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                </div>
              </Form.Group>
            </Col>

            {/* Confirm New Password */}
            <Col xs={12}>
              <Form.Group controlId="controlId-newPassword-confirm" className="form-group-custom">
                <Form.Label className="input-label-custom">
                  Confirm New Password <span className="text-danger">*</span>
                </Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={values.confirmPassword}
                    onChange={handleChange}
                    isInvalid={touched.confirmPassword && !!errors.confirmPassword}
                    isValid={touched.confirmPassword && !errors.confirmPassword}
                    placeholder="Re-enter new password"
                    className="form-control-custom shadow-none"
                    style={{ paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    className="btn position-absolute top-50 end-0 translate-middle-y me-2 p-1 border-0 text-muted"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    title={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon style={{ width: 18, height: 18 }} />
                    ) : (
                      <EyeIcon style={{ width: 18, height: 18 }} />
                    )}
                  </button>
                  <Form.Control.Feedback type="invalid">
                    {errors.confirmPassword}
                  </Form.Control.Feedback>
                </div>
              </Form.Group>
            </Col>
          </Row>

          <div
            className="p-3 mt-3 rounded-3"
            style={{ background: "#f8fafc", border: "1px solid #e2e8f0", fontSize: 12.5, color: "#475569" }}
          >
            <div className="d-flex align-items-center gap-2 mb-1 fw-semibold text-slate-800">
              <ShieldCheckIcon style={{ width: 16, height: 16, color: "#10b981" }} />
              <span>Password Security Requirements</span>
            </div>
            <span>Use at least 7 characters including letters and numbers for optimal administrative security.</span>
          </div>
        </Form>
      </Modal.Body>

      <Modal.Footer className="modal-footer-custom">
        <div className="d-flex justify-content-end gap-2 w-100">
          <Button
            variant="light"
            className="btn-modal-cancel"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="btn-modal-submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Updating...
              </>
            ) : (
              <>
                <CheckIcon className="btn-icon" />
                Update Password
              </>
            )}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

ChangePasswordModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
};

export default ChangePasswordModal;
