import React, { useRef, useState } from "react";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import { Button, Col, Form, Row, Spinner } from "react-bootstrap";
import * as yup from "yup";
import formSubmission from "api/user/formSubmission";
import handleSubmitForm from "api/user/handleSubmitForm";
import moment from "moment";
import "./applyForm.scss";
import {
  BanknotesIcon,
  ShieldCheckIcon,
  UserIcon,
  EnvelopeIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckBadgeIcon,
  ClockIcon,
  LockClosedIcon,
  CheckIcon,
  PrinterIcon,
  InformationCircleIcon,
  CreditCardIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";

const ApplyForm = ({ website }) => {
  // Wizard Step State: 1 = Verification, 2 = Loan Selection & Contact, 3 = Confirmation Receipt
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [availableLoans, setAvailableLoans] = useState([]);
  const [appliedLoans, setAppliedLoans] = useState([]);
  const [selectedLoans, setSelectedLoans] = useState([]);
  const [submittedLoansData, setSubmittedLoansData] = useState([]);
  const [confirmedDetails, setConfirmedDetails] = useState(null);
  const [isAlreadyApplied, setIsAlreadyApplied] = useState(false);

  // Institution title mapping
  const institutionName =
    website === "cpfcu"
      ? "CPFCU"
      : website === "npcu"
      ? "NPCU"
      : "Credit Union";

  // Step 1 Validation Schema: Verification
  const step1Schema = yup.object().shape({
    firstName: yup.string().trim().required("First name is required"),
    middleName: yup.string().trim(),
    lastName: yup.string().trim().required("Last name is required"),
    accountNumber: yup
      .string()
      .trim()
      .matches(/^\d+$/, "Enter a valid account number (digits only)")
      .required("Account number is required"),
    ssnNumber: yup
      .string()
      .trim()
      .matches(/^\d{3,4}$/, "Enter the last 3 or 4 digits of your SSN")
      .required("Last 4 of SSN is required"),
  });

  // Step 2 Validation Schema: Contact & Terms
  const step2Schema = yup.object().shape({
    email: yup
      .string()
      .trim()
      .email("Please enter a valid email address")
      .required("Email address is required"),
    cEmail: yup
      .string()
      .trim()
      .email("Please enter a valid email address")
      .oneOf([yup.ref("email"), null], "Email addresses do not match")
      .required("Confirm your email address"),
    phoneNumber: yup
      .string()
      .trim()
      .matches(/^(\+?\d{1,3}[- ]?)?\d{10}$/, "Please enter a valid 10-digit phone number")
      .required("Phone number is required"),
    agreedToTerms: yup
      .boolean()
      .oneOf([true], "You must agree to the Skip A Pay terms to proceed"),
  });

  // Combined Formik instance
  const formik = useFormik({
    initialValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      accountNumber: "",
      ssnNumber: "",
      email: "",
      cEmail: "",
      phoneNumber: "",
      agreedToTerms: true,
      website,
    },
    validationSchema: currentStep === 1 ? step1Schema : step2Schema,
    onSubmit: async (values) => {
      if (currentStep === 1) {
        // Step 1: Verify member identity and automatically pull eligible loans
        setIsLoading(true);
        const toastId = toast.loading("Verifying account and retrieving eligible loans...", {
          autoClose: false,
          closeOnClick: false,
        });

        try {
          const response = await formSubmission(values);
          if (response.status === 201 || response.status === 200) {
            toast.dismiss(toastId);
            const loansList = response.data?.availableLoans || [];
            const previousLoans = response.data?.user?.loan || [];
            const isPrevApplied = typeof response.data?.user === "object" && previousLoans.length > 0;

            setAvailableLoans(loansList);
            setAppliedLoans(previousLoans);
            setIsAlreadyApplied(isPrevApplied);

            // Automatically pre-select all eligible loans by default
            const initialSelected = loansList.map((l) => l._id);
            setSelectedLoans(initialSelected);

            if (loansList.length > 0 || isPrevApplied) {
              setTouched({
                firstName: true,
                lastName: true,
                accountNumber: true,
                ssnNumber: true,
                email: false,
                cEmail: false,
                phoneNumber: false,
                agreedToTerms: false,
              });
              setCurrentStep(2);
            } else {
              toast.info("No active eligible loans were found for this account.");
              setTouched({
                firstName: true,
                lastName: true,
                accountNumber: true,
                ssnNumber: true,
                email: false,
                cEmail: false,
                phoneNumber: false,
                agreedToTerms: false,
              });
              setCurrentStep(2);
            }
          } else {
            toast.update(toastId, {
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
          toast.update(toastId, {
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
      } else if (currentStep === 2) {
        // Step 2: Final Submission of selected loans
        if (!selectedLoans.length) {
          return toast.error("Please select at least one loan to skip.");
        }

        setIsLoading(true);
        const toastId = toast.loading("Processing your Skip A Pay request...", {
          autoClose: false,
          closeOnClick: false,
        });

        try {
          const payload = {
            ...values,
            loan: selectedLoans,
          };

          const response = isAlreadyApplied
            ? await handleSubmitForm.update(payload)
            : await handleSubmitForm.create(payload);

          if (response.status === 201 || response.status === 200) {
            toast.update(toastId, {
              render: "Skip A Pay application submitted successfully!",
              type: "success",
              isLoading: false,
              autoClose: 4000,
              closeButton: true,
              closeOnClick: true,
            });

            const confirmed = availableLoans.filter((l) => selectedLoans.includes(l._id));
            setSubmittedLoansData(confirmed.length > 0 ? confirmed : availableLoans);
            setConfirmedDetails(values);
            setCurrentStep(3);
          } else {
            toast.update(toastId, {
              render: response.message || "Failed to submit loan application.",
              type: "error",
              isLoading: false,
              autoClose: 5000,
              closeButton: true,
              closeOnClick: true,
            });
          }
        } catch (err) {
          toast.update(toastId, {
            render: err?.message || "An unexpected error occurred.",
            type: "error",
            isLoading: false,
            autoClose: 5000,
            closeButton: true,
            closeOnClick: true,
          });
        } finally {
          setIsLoading(false);
        }
      }
    },
  });

  const { errors, touched, handleSubmit, handleChange, values, resetForm, setTouched } = formik;

  // Toggle individual loan selection
  const handleToggleLoan = (loanId) => {
    setSelectedLoans((prev) =>
      prev.includes(loanId) ? prev.filter((id) => id !== loanId) : [...prev, loanId]
    );
  };

  // Select all or deselect all toggle
  const handleSelectAll = () => {
    if (selectedLoans.length === availableLoans.length) {
      setSelectedLoans([]);
    } else {
      setSelectedLoans(availableLoans.map((l) => l._id));
    }
  };

  // Restart application from Step 1
  const handleRestart = () => {
    resetForm();
    setAvailableLoans([]);
    setAppliedLoans([]);
    setSelectedLoans([]);
    setSubmittedLoansData([]);
    setConfirmedDetails(null);
    setIsAlreadyApplied(false);
    setCurrentStep(1);
  };

  const fullName = [values.firstName, values.middleName, values.lastName]
    .filter(Boolean)
    .join(" ");

  const initials = [values.firstName?.[0], values.lastName?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase() || "MB";

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
            
          </div>
          <h1 className="banner-title">Skip A Pay Application</h1>
          <p className="banner-desc">
            Verify your account, review automatically loaded eligible loans, and submit your skip request in minutes.
          </p>
        </div>

        {/* 3-Step Wizard Stepper */}
        <div className="wizard-stepper-bar">
          <div
            className={`step-node ${
              currentStep === 1 ? "active" : currentStep > 1 ? "completed" : ""
            }`}
          >
            <div className="step-circle">
              {currentStep > 1 ? <CheckIcon style={{ width: 16, height: 16 }} /> : "1"}
            </div>
            <span className="step-label">Account Verification</span>
          </div>

          <div className={`step-connector ${currentStep > 1 ? "completed" : ""}`} />

          <div
            className={`step-node ${
              currentStep === 2 ? "active" : currentStep > 2 ? "completed" : ""
            }`}
          >
            <div className="step-circle">
              {currentStep > 2 ? <CheckIcon style={{ width: 16, height: 16 }} /> : "2"}
            </div>
            <span className="step-label">Loan Selection & Contact</span>
          </div>

          <div className={`step-connector ${currentStep > 2 ? "completed" : ""}`} />

          <div className={`step-node ${currentStep === 3 ? "active completed" : ""}`}>
            <div className="step-circle">3</div>
            <span className="step-label">Confirmation Receipt</span>
          </div>
        </div>

        {/* ---------------- STEP 1: ACCOUNT VERIFICATION ---------------- */}
        {currentStep === 1 && (
          <div className="apply-form-body">
            <Form noValidate onSubmit={handleSubmit}>
              {/* Member Identification Section */}
              <div className="form-section-block">
                <div className="section-label-header">
                  <div className="section-icon-box">
                    <UserIcon className="sec-header-icon" />
                  </div>
                  <h2 className="section-title">Member Identity</h2>
                  <span className="section-hint">As listed on your credit union account</span>
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
                        placeholder="e.g. Jane"
                        value={values.firstName}
                        onChange={handleChange}
                        isValid={touched.firstName && !errors.firstName && !!values.firstName?.trim()}
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
                        placeholder="e.g. M."
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
                        placeholder="e.g. Smith"
                        value={values.lastName}
                        onChange={handleChange}
                        isValid={touched.lastName && !errors.lastName && !!values.lastName?.trim()}
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

              {/* Account Security Verification Section */}
              <div className="form-section-block">
                <div className="section-label-header">
                  <div className="section-icon-box">
                    <LockClosedIcon className="sec-header-icon" />
                  </div>
                  <h2 className="section-title">Account Security Matching</h2>
                  <span className="section-hint">Instant encrypted lookup</span>
                </div>

                <Row className="g-3">
                  <Col xs={12} md={7}>
                    <Form.Group className="form-group-custom" controlId="controlId-accountNumber">
                      <Form.Label className="input-label-custom">
                        Member Account Number <span className="req-star">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="accountNumber"
                        placeholder="Enter your account number"
                        value={values.accountNumber}
                        onChange={handleChange}
                        isValid={touched.accountNumber && !errors.accountNumber && !!values.accountNumber?.trim()}
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
                        isValid={touched.ssnNumber && !errors.ssnNumber && !!values.ssnNumber?.trim()}
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

              {/* Action Button */}
              <div className="form-actions-row">
                <Button
                  type="submit"
                  className="btn-submit-apply"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner size="sm" animation="border" className="me-2" />
                      Verifying & Finding Loans...
                    </>
                  ) : (
                    <>
                      <span>Verify & Load Eligible Loans</span>
                      <ArrowRightIcon className="submit-icon" />
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </div>
        )}

        {/* ---------------- STEP 2: AUTO-LOADED LOAN SELECTION & CONTACT ---------------- */}
        {currentStep === 2 && (
          <div className="apply-form-body">
            <Form noValidate onSubmit={handleSubmit}>
              {/* Member Profile Confirmation Strip */}
              <div className="applicant-summary-strip">
                <div className="applicant-info-left">
                  <div className="avatar-initials-badge">{initials}</div>
                  <div className="name-and-tag">
                    <div className="applicant-name">{fullName || "Verified Member"}</div>
                    <div className="account-subtext">
                      Account #{values.accountNumber} • SSN ending in ••{values.ssnNumber.slice(-2)}
                    </div>
                  </div>
                </div>

                <div className="applicant-verified-badge">
                  <CheckBadgeIcon className="v-icon" />
                  <span>Identity Verified</span>
                </div>
              </div>

              {/* Eligible Loans Section (Pre-selected automatically) */}
              <div className="form-section-block">
                <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                  <div>
                    <h3 className="section-title d-flex align-items-center gap-2 mb-1">
                      <BanknotesIcon style={{ width: 20, height: 20, color: "var(--primary, #030359)" }} />
                      Eligible Loans to Skip
                      <span className="badge rounded-pill bg-primary" style={{ fontSize: 11 }}>
                        {availableLoans.length} Available
                      </span>
                    </h3>
                    <p className="text-muted mb-0" style={{ fontSize: 13 }}>
                      All eligible loans are pre-selected for your convenience. Click to uncheck any loan:
                    </p>
                  </div>

                  {availableLoans.length > 1 && (
                    <Button
                      variant="link"
                      className="p-0 text-decoration-none fw-bold"
                      style={{ fontSize: 13, color: "var(--primary, #030359)" }}
                      onClick={handleSelectAll}
                    >
                      {selectedLoans.length === availableLoans.length ? "Deselect All" : "Select All"}
                    </Button>
                  )}
                </div>

                {availableLoans.length > 0 ? (
                  <Row className="g-3">
                    {availableLoans.map((loanItem) => {
                      const isSelected = selectedLoans.includes(loanItem._id);
                      const loanDisplayType =
                        loanItem.loan_type && isNaN(Number(loanItem.loan_type))
                          ? loanItem.loan_type
                          : "Loan Account";
                      const loanTitle =
                        loanItem.Description || loanItem.description || loanDisplayType;

                      return (
                        <Col xs={12} md={6} key={loanItem._id}>
                          <div
                            className={`loan-selection-card ${isSelected ? "selected" : ""}`}
                            onClick={() => handleToggleLoan(loanItem._id)}
                            role="checkbox"
                            aria-checked={isSelected}
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === " " || e.key === "Enter") {
                                e.preventDefault();
                                handleToggleLoan(loanItem._id);
                              }
                            }}
                          >
                            <div className="loan-card-top">
                              <div className="loan-badge-group">
                                <span className="loan-type-badge">
                                  {loanDisplayType}
                                </span>
                                <span className="loan-id-tag">
                                  Loan ID: #{loanItem.loan_id || loanItem._id}
                                </span>
                              </div>
                              <div className={`loan-checkbox-circle ${isSelected ? "checked" : ""}`}>
                                {isSelected && <CheckIcon className="check-icon-mini" />}
                              </div>
                            </div>

                            <div className="loan-desc-text">
                              <InformationCircleIcon className="desc-icon" />
                              <span>{loanTitle}</span>
                            </div>

                            <div className="loan-card-status-strip">
                              {isSelected ? (
                                <>
                                  <CheckIcon style={{ width: 14, height: 14, color: "#16a34a" }} />
                                  <span style={{ color: "#16a34a" }}>Selected for Skip</span>
                                </>
                              ) : (
                                <span className="text-muted">Click to select</span>
                              )}
                            </div>
                          </div>
                        </Col>
                      );
                    })}
                  </Row>
                ) : (
                  <div className="p-4 text-center rounded-3 bg-light border">
                    <p className="text-muted mb-0">No additional eligible loans found to skip.</p>
                  </div>
                )}
              </div>

              {/* Previously Applied Loans Section */}
              {isAlreadyApplied && (
                <div className="form-section-block">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <LockClosedIcon style={{ width: 16, height: 16, color: "#64748b" }} />
                    <h4 className="section-title text-muted mb-0" style={{ fontSize: 14 }}>
                      Previously Skipped Loans ({appliedLoans.length})
                    </h4>
                    <span className="text-muted ms-auto" style={{ fontSize: 12 }}>
                      Already processed for this cycle
                    </span>
                  </div>

                  <Row className="g-2">
                    {appliedLoans.map((applied, idx) => {
                      const appliedDisplayType =
                        applied.loan_type && isNaN(Number(applied.loan_type))
                          ? applied.loan_type
                          : "Loan Account";
                      const appliedTitle =
                        applied.Description || applied.description || appliedDisplayType;

                      return (
                        <Col xs={12} sm={6} key={applied._id || idx}>
                          <div className="p-3 rounded-3 bg-light border d-flex justify-content-between align-items-center">
                            <div>
                              <div className="fw-bold text-slate-800" style={{ fontSize: 13.5 }}>
                                {appliedTitle}
                              </div>
                              <div className="text-muted font-monospace mt-1" style={{ fontSize: 11.5 }}>
                                Loan ID: #{applied.loan_id || applied._id}
                              </div>
                            </div>
                            <span className="badge bg-secondary px-2 py-1" style={{ fontSize: 11 }}>
                              Already Skipped
                            </span>
                          </div>
                        </Col>
                      );
                    })}
                  </Row>
                </div>
              )}

              {/* Contact Information & Notification Section */}
              <div className="form-section-block">
                <div className="section-label-header">
                  <div className="section-icon-box">
                    <EnvelopeIcon className="sec-header-icon" />
                  </div>
                  <h2 className="section-title">Contact & Confirmation Delivery</h2>
                  <span className="section-hint">Where to send receipt</span>
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
                        placeholder="jane.smith@example.com"
                        value={values.email}
                        onChange={handleChange}
                        isValid={touched.email && !errors.email && !!values.email?.trim()}
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
                        placeholder="Re-enter email address"
                        value={values.cEmail}
                        onChange={handleChange}
                        isValid={touched.cEmail && !errors.cEmail && !!values.cEmail?.trim()}
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
                        isValid={touched.phoneNumber && !errors.phoneNumber && !!values.phoneNumber?.trim()}
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

              {/* Authorization Checkbox */}
              <div className="mb-4 p-3 rounded-3 bg-light border">
                <Form.Check
                  type="checkbox"
                  id="agreed-to-terms"
                  name="agreedToTerms"
                  checked={values.agreedToTerms}
                  onChange={handleChange}
                  label={
                    <span style={{ fontSize: 13, color: "#334155" }}>
                      I authorize the credit union to skip my selected loan payment(s). I understand interest continues to accrue during the skipped period.
                    </span>
                  }
                  isInvalid={touched.agreedToTerms && !!errors.agreedToTerms}
                />
                {touched.agreedToTerms && errors.agreedToTerms && (
                  <div className="text-danger mt-1" style={{ fontSize: 12 }}>
                    {errors.agreedToTerms}
                  </div>
                )}
              </div>

              {/* Actions Row */}
              <div className="form-actions-row">
                <Button
                  type="button"
                  variant="light"
                  className="btn-back-apply"
                  onClick={() => setCurrentStep(1)}
                  disabled={isLoading}
                >
                  <ArrowLeftIcon style={{ width: 16, height: 16 }} />
                  Back
                </Button>

                <Button
                  type="submit"
                  className="btn-submit-apply"
                  disabled={!selectedLoans.length || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner size="sm" animation="border" className="me-2" />
                      Submitting Request...
                    </>
                  ) : (
                    <>
                      <span>Confirm & Skip {selectedLoans.length} Loan{selectedLoans.length > 1 ? "s" : ""}</span>
                      <ArrowRightIcon className="submit-icon" />
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </div>
        )}

        {/* ---------------- STEP 3: DIGITAL CONFIRMATION RECEIPT ---------------- */}
        {currentStep === 3 && (
          <div className="receipt-view-wrapper">
            <div className="receipt-success-badge">
              <CheckCircleSolid className="receipt-big-check" />
            </div>

            <h2 className="receipt-title">Skip A Pay Confirmed!</h2>
            <p className="receipt-subtitle">
              Your request has been successfully recorded and submitted to {institutionName}. A confirmation has been registered for your account.
            </p>

            <div className="receipt-details-card">
              <div className="receipt-grid-row">
                <div className="meta-item">
                  <div className="meta-label">Applicant Name</div>
                  <div className="meta-val">{fullName || confirmedDetails?.firstName}</div>
                </div>
                <div className="meta-item">
                  <div className="meta-label">Account Number</div>
                  <div className="meta-val">{confirmedDetails?.accountNumber}</div>
                </div>
                <div className="meta-item">
                  <div className="meta-label">Notification Email</div>
                  <div className="meta-val">{confirmedDetails?.email}</div>
                </div>
                <div className="meta-item">
                  <div className="meta-label">Date Submitted</div>
                  <div className="meta-val">{moment().format("MMM DD, YYYY • hh:mm A")}</div>
                </div>
              </div>

              <div className="receipt-skipped-loans-heading">
                <CheckBadgeIcon style={{ width: 18, height: 18, color: "#16a34a" }} />
                <span>Successfully Skipped Loan(s)</span>
                <span className="badge-count">{submittedLoansData.length} Skipped</span>
              </div>

              {submittedLoansData.map((loan, idx) => (
                <div key={loan._id || idx} className="receipt-loan-pill">
                  <div>
                    <div className="pill-type-title">{loan.loan_type || "Loan"}</div>
                    <div className="pill-id-chip">#{loan.loan_id || loan._id} • {loan.Description || loan.description || "General Skip"}</div>
                  </div>
                  <span className="pill-status-done">
                    <CheckCircleSolid style={{ width: 16, height: 16 }} /> Skipped
                  </span>
                </div>
              ))}
            </div>

            <div className="receipt-actions-group">
              <button
                type="button"
                className="btn-print-receipt"
                onClick={() => window.print()}
              >
                <PrinterIcon className="btn-icon" />
                Print Confirmation
              </button>

              <button
                type="button"
                className="btn-new-app"
                onClick={handleRestart}
              >
                Start New Application
              </button>
            </div>
          </div>
        )}

        {/* Trust Indicators Footer */}
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
    </div>
  );
};

export default ApplyForm;
