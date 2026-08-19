import PropTypes from "prop-types";
import { Col, Container, Row, Button } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import ModalComponent1 from "./ModalComponent1";
import "./style/Modal.scss";
import { useState, useEffect } from "react";
import moment from "moment";
import { toast } from "react-toastify";
import handleSubmitForm from "api/user/handleSubmitForm";
import {
  BanknotesIcon,
  EnvelopeIcon,
  PhoneIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  LockClosedIcon,
  InformationCircleIcon,
  DocumentCheckIcon,
  CheckIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";

/**
 * CustomModal is a custom React modal component for reviewing applicant info,
 * automatically displaying/pre-selecting eligible loans, and showing a post-submission receipt.
 *
 * @param {Object} props - The properties for configuring the modal.
 * @param {string} props.title - The title of the modal.
 * @param {boolean} props.show - A boolean indicating whether the modal is open or closed.
 * @param {function} props.onHide - A function to close the modal when triggered.
 * @param {Object} props.userdetails - The user data object.
 */
const CustomModal = (props) => {
  const { userdetails: userDetails = {}, show, onHide, title = "Skip-A-Pay Loan Selection" } = props;
  const availableLoans = userDetails?.loantype?.availableLoans || [];
  const appliedLoans = userDetails?.loantype?.user?.loan || [];

  const isAlreadyApplied = typeof userDetails?.loantype?.user === "object" && appliedLoans.length > 0;
  const isLoansAvailable = availableLoans.length > 0;

  // Auto-select all available loans by default so the member doesn't have to click them individually
  const [selectedLoans, setSelectedLoans] = useState(() => {
    return availableLoans.map((l) => l._id);
  });

  // Track submission state and confirmation receipt view
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [submittedLoansData, setSubmittedLoansData] = useState([]);

  // If availableLoans changes, ensure loans are auto-selected
  useEffect(() => {
    if (availableLoans.length > 0 && selectedLoans.length === 0 && !isSubmittedSuccess) {
      setSelectedLoans(availableLoans.map((l) => l._id));
    }
  }, [availableLoans, isSubmittedSuccess]);

  // Applicant full name
  const nameParts = [userDetails?.firstName, userDetails?.middleName, userDetails?.lastName].filter(Boolean);
  const fullName = nameParts.length > 0 ? nameParts.join(" ") : "Applicant Details";

  // Applicant initials for avatar badge
  const initials = [userDetails?.firstName?.[0], userDetails?.lastName?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase() || "AP";

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

  // Loan form submission
  const handleSubmitData = async () => {
    if (!selectedLoans.length) {
      return toast.error("Please select at least one loan to skip");
    }

    try {
      setIsSubmitting(true);
      const payload = { ...userDetails, loan: selectedLoans };
      const response = isAlreadyApplied
        ? await handleSubmitForm.update(payload)
        : await handleSubmitForm.create(payload);

      if (response.status === 201 || response.status === 200) {
        toast.success(
          `Loan skip application ${isAlreadyApplied ? "updated" : "submitted"} successfully!`
        );
        // Find full details of the applied loans to show on confirmation screen
        const confirmedLoans = availableLoans.filter((l) => selectedLoans.includes(l._id));
        setSubmittedLoansData(confirmedLoans.length > 0 ? confirmedLoans : availableLoans);
        setIsSubmittedSuccess(true);
      } else {
        toast.error(response.message || "Failed to submit loan application.");
      }
    } catch (err) {
      toast.error(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedDate = userDetails?.createdAt
    ? moment(userDetails.createdAt).format("MMM DD, YYYY • hh:mm A")
    : moment().format("MMM DD, YYYY • hh:mm A");

  const maskedSsn = userDetails?.ssnNumber
    ? `•••-••-${userDetails.ssnNumber.slice(-4)}`
    : "—";

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      aria-labelledby="skip-modal-title"
      centered
      className="custom-skip-modal"
    >
      {/* ---------------- CONFIRMATION / RECEIPT VIEW ---------------- */}
      {isSubmittedSuccess ? (
        <>
          <Modal.Header closeButton className="modal-header-custom success-header">
            <div className="d-flex align-items-center gap-3">
              <div className="header-icon-badge success-badge">
                <SparklesIcon className="header-icon" />
              </div>
              <div>
                <Modal.Title id="skip-modal-title" className="modal-title-text text-success-emphasis">
                  Application Confirmed
                </Modal.Title>
                <p className="modal-subtitle-text mb-0">
                  Your Skip-A-Payment request has been successfully recorded
                </p>
              </div>
            </div>
          </Modal.Header>

          <Modal.Body className="modal-body-custom">
            <Container fluid className="px-0">
              {/* Success Banner Card */}
              <div className="submission-success-card mb-4 text-center">
                <div className="success-icon-bubble mb-3">
                  <CheckCircleSolid className="success-big-icon" />
                </div>
                <h3 className="success-card-title">Skip-A-Payment Approved & Logged!</h3>
                <p className="success-card-desc">
                  Thank you, <strong>{fullName}</strong>. Below are the details of the loan(s) you have applied to skip:
                </p>
              </div>

              {/* Summary of What Was Applied For */}
              <div className="applied-summary-section mb-4">
                <div className="section-header-row mb-3">
                  <h4 className="section-heading mb-1 d-flex align-items-center gap-2">
                    <DocumentCheckIcon className="section-icon text-success" />
                    Applied Loan(s) Summary
                    <span className="count-badge applied-badge-success">
                      {submittedLoansData.length} Loan{submittedLoansData.length > 1 ? "s" : ""}
                    </span>
                  </h4>
                </div>

                <div className="loan-cards-grid">
                  <Row className="g-3">
                    {submittedLoansData.map((loanItem, index) => (
                      <Col xs={12} md={6} key={loanItem._id || index}>
                        <div className="loan-selection-card confirmed-loan-card">
                          <div className="loan-card-top">
                            <div className="loan-badge-group">
                              <span className="loan-type-badge confirmed-badge">
                                {loanItem.loan_type || "Loan"}
                              </span>
                              <span className="loan-id-tag">
                                #{loanItem.loan_id || loanItem._id}
                              </span>
                            </div>
                            <span className="confirmed-pill">
                              <CheckCircleSolid className="check-icon-mini" /> Skipped
                            </span>
                          </div>

                          <div className="loan-card-body">
                            <div className="loan-description-row">
                              <InformationCircleIcon className="desc-icon" />
                              <span className="loan-desc-text">
                                {loanItem.Description ||
                                  loanItem.description ||
                                  "Payment skipped for next cycle"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              </div>

              {/* Applicant & Reference Metadata Card */}
              <div className="applicant-profile-card">
                <h5 className="summary-card-subheading mb-3">Confirmation Reference</h5>
                <Row className="g-2">
                  <Col xs={12} sm={6}>
                    <ModalComponent1
                      icon={CreditCardIcon}
                      title="Account Number"
                      subtitle={userDetails?.accountNumber}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <ModalComponent1
                      icon={EnvelopeIcon}
                      title="Confirmation Sent To"
                      subtitle={userDetails?.email}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <ModalComponent1
                      icon={CalendarDaysIcon}
                      title="Processed Date"
                      subtitle={moment().format("MMM DD, YYYY • hh:mm A")}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <ModalComponent1
                      icon={ShieldCheckIcon}
                      title="Status"
                      subtitle="Completed & Saved"
                    />
                  </Col>
                </Row>
              </div>
            </Container>
          </Modal.Body>

          <Modal.Footer className="modal-footer-custom">
            <div className="d-flex justify-content-end w-100">
              <Button
                variant="primary"
                className="btn-modal-submit"
                onClick={onHide}
              >
                <CheckIcon className="btn-icon" />
                Done
              </Button>
            </div>
          </Modal.Footer>
        </>
      ) : (
        /* ---------------- LOAN SELECTION & REVIEW VIEW ---------------- */
        <>
          {/* Modal Header */}
          <Modal.Header closeButton className="modal-header-custom">
            <div className="d-flex align-items-center gap-3">
              <div className="header-icon-badge">
                <DocumentCheckIcon className="header-icon" />
              </div>
              <div>
                <Modal.Title id="skip-modal-title" className="modal-title-text">
                  {title}
                </Modal.Title>
                <p className="modal-subtitle-text mb-0">
                  Review applicant details and select eligible loans to skip
                </p>
              </div>
            </div>
          </Modal.Header>

          <Modal.Body className="modal-body-custom">
            <Container fluid className="px-0">
              {/* Section 1: Applicant Profile Card */}
              <div className="applicant-profile-card mb-4">
                <div className="applicant-header">
                  <div className="d-flex align-items-center gap-3">
                    <div className="applicant-avatar">{initials}</div>
                    <div>
                      <h3 className="applicant-name mb-0">{fullName}</h3>
                      <span className="applicant-tag">
                        {isAlreadyApplied ? "Existing Application" : "Active Member"}
                      </span>
                    </div>
                  </div>
                  <div className="submission-pill">
                    <CalendarDaysIcon className="pill-icon" />
                    <span>{formattedDate}</span>
                  </div>
                </div>

                <div className="applicant-info-grid mt-3">
                  <Row className="g-2">
                    <Col xs={12} sm={6} md={4}>
                      <ModalComponent1
                        icon={EnvelopeIcon}
                        title="Email Address"
                        subtitle={userDetails?.email}
                      />
                    </Col>
                    <Col xs={12} sm={6} md={4}>
                      <ModalComponent1
                        icon={PhoneIcon}
                        title="Phone Number"
                        subtitle={userDetails?.phoneNumber}
                      />
                    </Col>
                    <Col xs={12} sm={6} md={4}>
                      <ModalComponent1
                        icon={CreditCardIcon}
                        title="Account Number"
                        subtitle={userDetails?.accountNumber}
                      />
                    </Col>
                    <Col xs={12} sm={6} md={4}>
                      <ModalComponent1
                        icon={ShieldCheckIcon}
                        title="SSN (Last 4)"
                        subtitle={maskedSsn}
                      />
                    </Col>
                    <Col xs={12} sm={6} md={8}>
                      <ModalComponent1
                        icon={CalendarDaysIcon}
                        title="Submitted Timestamp"
                        subtitle={formattedDate}
                      />
                    </Col>
                  </Row>
                </div>
              </div>

              {/* Section 2: Eligible Loans Selection (Auto-Shown & Pre-selected) */}
              {isLoansAvailable && (
                <div className="loans-section mb-4">
                  <div className="section-header-row mb-3">
                    <div>
                      <h4 className="section-heading mb-1 d-flex align-items-center gap-2">
                        <BanknotesIcon className="section-icon" />
                        Eligible Loans
                        <span className="count-badge">{availableLoans.length}</span>
                      </h4>
                      <p className="section-subheading mb-0">
                        The loans below are automatically selected. Uncheck any loan you do not wish to skip:
                      </p>
                    </div>
                    {availableLoans.length > 1 && (
                      <Button
                        variant="link"
                        className="select-all-btn p-0 text-decoration-none"
                        onClick={handleSelectAll}
                      >
                        {selectedLoans.length === availableLoans.length
                          ? "Deselect All"
                          : "Select All"}
                      </Button>
                    )}
                  </div>

                  <div className="loan-cards-grid">
                    <Row className="g-3">
                      {availableLoans.map((loanItem, index) => {
                        const isSelected = selectedLoans.includes(loanItem._id);
                        return (
                          <Col xs={12} md={6} key={loanItem._id || index}>
                            <div
                              className={`loan-selection-card ${
                                isSelected ? "selected" : ""
                              }`}
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
                                    {loanItem.loan_type || "Loan"}
                                  </span>
                                  <span className="loan-id-tag">
                                    #{loanItem.loan_id || loanItem._id}
                                  </span>
                                </div>
                                <div className={`loan-checkbox ${isSelected ? "checked" : ""}`}>
                                  {isSelected ? (
                                    <CheckCircleSolid className="check-icon-solid" />
                                  ) : (
                                    <div className="checkbox-empty" />
                                  )}
                                </div>
                              </div>

                              <div className="loan-card-body">
                                <div className="loan-description-row">
                                  <InformationCircleIcon className="desc-icon" />
                                  <span className="loan-desc-text">
                                    {loanItem.Description ||
                                      loanItem.description ||
                                      "No additional description provided"}
                                  </span>
                                </div>
                              </div>

                              <div className="loan-card-footer">
                                <span className="selection-status-text">
                                  {isSelected ? (
                                    <>
                                      <CheckIcon className="mini-check" /> Selected to Skip
                                    </>
                                  ) : (
                                    "Click to select"
                                  )}
                                </span>
                              </div>
                            </div>
                          </Col>
                        );
                      })}
                    </Row>
                  </div>
                </div>
              )}

              {/* Section 3: Already Applied Loans (Read-Only) */}
              {isAlreadyApplied && (
                <div className="loans-section already-applied-section mb-3">
                  <div className="section-header-row mb-3">
                    <h4 className="section-heading mb-1 d-flex align-items-center gap-2 text-muted">
                      <LockClosedIcon className="section-icon text-muted" />
                      Previously Applied Loans
                      <span className="count-badge applied-badge">{appliedLoans.length}</span>
                    </h4>
                    <p className="section-subheading mb-0">
                      These loans have already been processed for skip payment
                    </p>
                  </div>

                  <div className="loan-cards-grid">
                    <Row className="g-3">
                      {appliedLoans.map((appliedLoan, index) => (
                        <Col xs={12} md={6} key={appliedLoan._id || index}>
                          <div className="loan-selection-card already-applied-card">
                            <div className="loan-card-top">
                              <div className="loan-badge-group">
                                <span className="loan-type-badge muted-type">
                                  {appliedLoan.loan_type || "Loan"}
                                </span>
                                <span className="loan-id-tag">
                                  #{appliedLoan.loan_id || appliedLoan._id}
                                </span>
                              </div>
                              <span className="applied-pill">
                                <LockClosedIcon className="lock-icon" /> Applied
                              </span>
                            </div>

                            <div className="loan-card-body">
                              <div className="loan-description-row">
                                <InformationCircleIcon className="desc-icon" />
                                <span className="loan-desc-text">
                                  {appliedLoan.Description ||
                                    appliedLoan.description ||
                                    "No additional description"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </div>
                </div>
              )}

              {/* Fallback when no loans are eligible */}
              {!isLoansAvailable && !isAlreadyApplied && (
                <div className="empty-loans-card text-center py-5">
                  <div className="empty-icon-wrapper mb-3">
                    <InformationCircleIcon className="empty-icon" />
                  </div>
                  <h5 className="empty-title">No Eligible Loans Found</h5>
                  <p className="empty-desc text-muted mb-0">
                    There are currently no active loans eligible to skip on this member account.
                  </p>
                </div>
              )}
            </Container>
          </Modal.Body>

          {/* Modal Footer */}
          <Modal.Footer className="modal-footer-custom">
            <div className="d-flex align-items-center justify-content-between w-100">
              <div className="footer-status-text">
                {isLoansAvailable && (
                  <span>
                    <strong>{selectedLoans.length}</strong> of{" "}
                    <strong>{availableLoans.length}</strong> loan{availableLoans.length > 1 ? "s" : ""} selected
                  </span>
                )}
              </div>

              <div className="d-flex gap-2">
                <Button
                  variant="light"
                  className="btn-modal-cancel"
                  onClick={onHide}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                {isLoansAvailable ? (
                  <Button
                    variant="primary"
                    className="btn-modal-submit"
                    onClick={handleSubmitData}
                    disabled={!selectedLoans.length || isSubmitting}
                  >
                    {isSubmitting ? (
                      "Submitting..."
                    ) : (
                      <>
                        <CheckCircleIcon className="btn-icon" />
                        Apply for Skip ({selectedLoans.length})
                      </>
                    )}
                  </Button>
                ) : (
                  <Button variant="secondary" className="btn-modal-cancel" onClick={onHide}>
                    Close
                  </Button>
                )}
              </div>
            </div>
          </Modal.Footer>
        </>
      )}
    </Modal>
  );
};

CustomModal.propTypes = {
  title: PropTypes.string,
  show: PropTypes.bool,
  onHide: PropTypes.func.isRequired,
  userdetails: PropTypes.object,
};

export default CustomModal;
