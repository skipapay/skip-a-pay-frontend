import React, { useRef, useState } from "react";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import { Button, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import * as yup from "yup";
import CustomModal from "components/Modal";
import formSubmission from "api/user/formSubmission";
import "./applyForm.scss";
import {
  BanknotesIcon,
  ShieldCheckIcon,
  UserIcon,
  EnvelopeIcon,
  ArrowRightIcon,
  CheckBadgeIcon,
  ClockIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";

const ApplyForm = ({ website }) => {
  const [modalShow, setModalShow] = useState(false);
  const [validated, setValidated] = useState(false);
  const [userDetails, setUserDetails] = useState({ website });
  const [isLoading, setIsLoading] = useState(false);
  const toastId = useRef(null);
  const formRef = useRef(null);

  // Institution title mapping
  const institutionName =
    website === "cpfcu"
      ? "CPFCU"
      : website === "npcu"
      ? "NPCU"
      : "Credit Union";

  // Form validation schema
  const schema = yup.object().shape({
    firstName: yup.string().trim().required("First name is required"),
    middleName: yup.string().trim(),
    lastName: yup.string().trim().required("Last name is required"),
    phoneNumber: yup
      .string()
      .matches(/^(\+?\d{1,3}[- ]?)?\d{10}$/, "Please enter a valid 10-digit phone number")
      .required("Phone number is required"),
    accountNumber: yup
      .string()
      .matches(/^\d+$/, "Enter a valid account number (digits only)")
      .required("Account number is required"),
    ssnNumber: yup
      .string()
      .matches(/^\d{3,4}$/, "Enter the last 3 or 4 digits of your SSN")
      .required("Last 4 of SSN is required"),
    email: yup
      .string()
      .email("Please enter a valid email address")
      .required("Email address is required"),
    cEmail: yup
      .string()
      .email("Please enter a valid email address")
      .oneOf([yup.ref("email"), null], "Email addresses do not match")
      .required("Confirm your email address"),
  });

  const formik = useFormik({
    validationSchema: schema,
    initialValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      phoneNumber: "",
      accountNumber: "",
      ssnNumber: "",
      email: "",
      cEmail: "",
      website,
    },
    onSubmit: async (values) => {
      setValidated(true);
      setIsLoading(true);
      toastId.current = toast.loading("Verifying account and retrieving loan details...", {
        autoClose: false,
        closeOnClick: false,
      });

      try {
        const response = await formSubmission(values);
        if (response.status === 201 || response.status === 200) {
          toast.dismiss(toastId.current);
          setUserDetails({
            ...values,
            loantype: response.data,
          });
          setModalShow(true);
        } else {
          toast.update(toastId.current, {
            render:
              "Unable to verify details. Please check your account number and last 4 of SSN. For assistance, contact support.",
            type: "error",
            isLoading: false,
            autoClose: 5000,
            closeButton: true,
            closeOnClick: true,
          });
        }
      } catch (error) {
        toast.update(toastId.current, {
          render: error?.message || "An error occurred during verification.",
          type: "error",
          isLoading: false,
          autoClose: 5000,
          closeButton: true,
          closeOnClick: true,
        });
      } finally {
        setIsLoading(false);
      }
    },
  });

  const { errors, touched, handleSubmit, handleChange, handleReset, values } = formik;

  return (
    <div className="apply-form-container">
      <div className="apply-card-wrapper">
        {/* Banner Header */}
        <div className="apply-header-banner">
          <div className="banner-top-row">
            <div className="brand-badge">
              <BanknotesIcon className="badge-icon" />
              <span>{institutionName} Portal</span>
            </div>
            <div className="security-pill">
              <ShieldCheckIcon className="sec-icon" />
              <span>256-Bit SSL Encrypted</span>
            </div>
          </div>
          <h1 className="banner-title">Skip-A-Payment Application</h1>
          <p className="banner-desc">
            Enter your account verification details below to check your eligible loans and select which payments you would like to skip.
          </p>
        </div>

        {/* Form Body */}
        <div className="apply-form-body">
          <Form
            ref={formRef}
            noValidate
            onSubmit={handleSubmit}
            onReset={handleReset}
          >
            {/* Section 1: Member Identity */}
            <div className="form-section-block">
              <div className="section-label-header">
                <div className="section-icon-box">
                  <UserIcon className="sec-header-icon" />
                </div>
                <h2 className="section-title">Member Information</h2>
                <span className="section-hint">As listed on your account</span>
              </div>

              <Row className="g-3">
                <Col xs={12} md={4}>
                  <Form.Group className="form-group-custom" controlId="controlId-firstName">
                    <Form.Label className="input-label-custom">
                      First Name <span className="req-star">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="firstName"
                      placeholder="e.g. John"
                      value={values.firstName}
                      onChange={handleChange}
                      isValid={touched.firstName && !errors.firstName}
                      isInvalid={touched.firstName && !!errors.firstName}
                      className="form-control-custom shadow-none"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.firstName}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col xs={12} md={4}>
                  <Form.Group className="form-group-custom" controlId="controlId-middleName">
                    <Form.Label className="input-label-custom">
                      Middle Name <span className="text-muted fw-normal">(Optional)</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="middleName"
                      placeholder="e.g. A."
                      value={values.middleName}
                      onChange={handleChange}
                      className="form-control-custom shadow-none"
                    />
                  </Form.Group>
                </Col>

                <Col xs={12} md={4}>
                  <Form.Group className="form-group-custom" controlId="controlId-lastName">
                    <Form.Label className="input-label-custom">
                      Last Name <span className="req-star">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="lastName"
                      placeholder="e.g. Doe"
                      value={values.lastName}
                      onChange={handleChange}
                      isValid={touched.lastName && !errors.lastName}
                      isInvalid={touched.lastName && !!errors.lastName}
                      className="form-control-custom shadow-none"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.lastName}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* Section 2: Contact Information */}
            <div className="form-section-block">
              <div className="section-label-header">
                <div className="section-icon-box">
                  <EnvelopeIcon className="sec-header-icon" />
                </div>
                <h2 className="section-title">Contact Details</h2>
                <span className="section-hint">For confirmation and updates</span>
              </div>

              <Row className="g-3">
                <Col xs={12} md={6}>
                  <Form.Group className="form-group-custom" controlId="controlId-email">
                    <Form.Label className="input-label-custom">
                      Email Address <span className="req-star">*</span>
                    </Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="john.doe@example.com"
                      value={values.email}
                      onChange={handleChange}
                      isValid={touched.email && !errors.email}
                      isInvalid={touched.email && !!errors.email}
                      className="form-control-custom shadow-none"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col xs={12} md={6}>
                  <Form.Group className="form-group-custom" controlId="controlId-cEmail">
                    <Form.Label className="input-label-custom">
                      Confirm Email Address <span className="req-star">*</span>
                    </Form.Label>
                    <Form.Control
                      type="email"
                      name="cEmail"
                      placeholder="Confirm email address"
                      value={values.cEmail}
                      onChange={handleChange}
                      isValid={touched.cEmail && !errors.cEmail}
                      isInvalid={touched.cEmail && !!errors.cEmail}
                      className="form-control-custom shadow-none"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.cEmail}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col xs={12}>
                  <Form.Group className="form-group-custom" controlId="controlId-phoneNumber">
                    <Form.Label className="input-label-custom">
                      Phone Number <span className="req-star">*</span>
                    </Form.Label>
                    <Form.Control
                      type="tel"
                      name="phoneNumber"
                      placeholder="e.g. 5551234567"
                      value={values.phoneNumber}
                      onChange={handleChange}
                      isValid={touched.phoneNumber && !errors.phoneNumber}
                      isInvalid={touched.phoneNumber && !!errors.phoneNumber}
                      className="form-control-custom shadow-none"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.phoneNumber}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* Section 3: Account Verification */}
            <div className="form-section-block">
              <div className="section-label-header">
                <div className="section-icon-box">
                  <LockClosedIcon className="sec-header-icon" />
                </div>
                <h2 className="section-title">Account Security Verification</h2>
                <span className="section-hint">Secure matching</span>
              </div>

              <Row className="g-3">
                <Col xs={12} md={7}>
                  <Form.Group className="form-group-custom" controlId="controlId-accountNumber">
                    <Form.Label className="input-label-custom">
                      Account Number <span className="req-star">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="accountNumber"
                      placeholder="Enter your member account number"
                      value={values.accountNumber}
                      onChange={handleChange}
                      isValid={touched.accountNumber && !errors.accountNumber}
                      isInvalid={touched.accountNumber && !!errors.accountNumber}
                      className="form-control-custom shadow-none"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.accountNumber}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col xs={12} md={5}>
                  <Form.Group className="form-group-custom" controlId="controlId-ssnNumber">
                    <Form.Label className="input-label-custom">
                      Last 4 Digits of SSN <span className="req-star">*</span>
                    </Form.Label>
                    <Form.Control
                      type="password"
                      maxLength={4}
                      name="ssnNumber"
                      placeholder="••••"
                      value={values.ssnNumber}
                      onChange={handleChange}
                      isValid={touched.ssnNumber && !errors.ssnNumber}
                      isInvalid={touched.ssnNumber && !!errors.ssnNumber}
                      className="form-control-custom shadow-none"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.ssnNumber}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* Actions */}
            <div className="form-actions-row">
              <Button
                type="submit"
                className="btn-submit-apply"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner size="sm" animation="border" className="me-2" />
                    Checking Eligibility...
                  </>
                ) : (
                  <>
                    <span>Verify & View Loan Details</span>
                    <ArrowRightIcon className="submit-icon" />
                  </>
                )}
              </Button>

              <Button
                type="reset"
                className="btn-reset-apply"
                disabled={isLoading}
              >
                Reset Form
              </Button>
            </div>
          </Form>
        </div>

        {/* Security & Trust Footer */}
        <div className="apply-trust-footer">
          <div className="trust-items-row">
            <div className="trust-item">
              <CheckBadgeIcon className="trust-icon" />
              <span>Instant Verification</span>
            </div>
            <div className="trust-item">
              <ShieldCheckIcon className="trust-icon" />
              <span>Safe & Confidential</span>
            </div>
            <div className="trust-item">
              <ClockIcon className="trust-icon" />
              <span>Quick Skip Processing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Loan Details Modal with Auto-Selection and Post-Submission Receipt */}
      {modalShow && (
        <CustomModal
          userdetails={userDetails}
          show={modalShow}
          title={"Skip-A-Pay Loan Selection"}
          onHide={() => setModalShow(false)}
        />
      )}
    </div>
  );
};

export default ApplyForm;
