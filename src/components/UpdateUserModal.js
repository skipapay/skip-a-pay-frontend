import React, { useState } from "react";
import PropTypes from "prop-types";
import { Modal, Button, Form, Row, Col, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as yup from "yup";
import { useSelector, useDispatch } from "react-redux";
import updateAdmin from "api/admin/updateAdmin";
import { updateUser } from "features/auth/authSlice";
import {
  UserCircleIcon,
  EnvelopeIcon,
  CheckIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

const UpdateUserModal = ({ show, handleClose }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const schema = yup.object().shape({
    name: yup.string().trim().required("Full name is required"),
    email: yup.string().email("Please enter a valid email").required("Email address is required"),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        const data = { name: values.name.trim(), email: values.email.trim() };
        const response = await updateAdmin(data);

        if (response.status === 201 || response.status === 200) {
          dispatch(
            updateUser({
              name: response.data.name,
              email: response.data.email,
            })
          );
          toast.success("Profile updated successfully!");
          handleClose();
        } else {
          toast.error(response.message || "Failed to update profile.");
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
          <div className="header-icon-badge">
            <UserCircleIcon className="header-icon" />
          </div>
          <div>
            <Modal.Title id="update-user-title" className="modal-title-text">
              Update Admin Profile
            </Modal.Title>
            <p className="modal-subtitle-text mb-0">
              Manage your display name and administrative contact email
            </p>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="modal-body-custom">
        <Form noValidate onSubmit={handleSubmit}>
          <Row className="g-3">
            <Col xs={12}>
              <Form.Group controlId="controlId-name" className="form-group-custom">
                <Form.Label className="input-label-custom">
                  Full Name <span className="text-danger">*</span>
                </Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type="text"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    isInvalid={touched.name && !!errors.name}
                    isValid={touched.name && !errors.name}
                    placeholder="Enter your full name"
                    className="form-control-custom shadow-none"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                </div>
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group controlId="controlId-email" className="form-group-custom">
                <Form.Label className="input-label-custom">
                  Email Address <span className="text-danger">*</span>
                </Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type="email"
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    isInvalid={touched.email && !!errors.email}
                    isValid={touched.email && !errors.email}
                    placeholder="admin@example.com"
                    className="form-control-custom shadow-none"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </div>
              </Form.Group>
            </Col>
          </Row>
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
                Saving...
              </>
            ) : (
              <>
                <CheckIcon className="btn-icon" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

UpdateUserModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
};

export default UpdateUserModal;
