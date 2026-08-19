import React from "react";
import PropTypes from "prop-types";
import { Modal, Button } from "react-bootstrap";
import handleDeleteApiLoan from "api/user/deleteLoan";
import { toast } from "react-toastify";
import { ExclamationTriangleIcon, TrashIcon } from "@heroicons/react/24/outline";

const AccountsDeleteModal = ({
  show,
  id = "",
  handleClose,
  getLoansDetails,
  skip,
}) => {
  const isBulkDelete = !id;

  const handleDelete = async () => {
    try {
      let response = await handleDeleteApiLoan(id);
      if (response?.data?.acknowledged && response?.status === 202) {
        if (response?.data?.acknowledged > 1) {
          toast.success("All member accounts have been deleted successfully.");
        } else {
          toast.success("Member account deleted successfully.");
        }
        const searchParams = new URLSearchParams(window.location.search);
        const queryPayload = {};
        if (searchParams.get("search")) queryPayload.search = searchParams.get("search");
        if (searchParams.get("skip")) queryPayload.skip = searchParams.get("skip");
        if (searchParams.get("limit")) queryPayload.limit = searchParams.get("limit");

        getLoansDetails(queryPayload);
      } else {
        if (response?.status === 500) {
          toast.error(response.message);
        } else {
          toast.error("Account record not found.");
        }
      }
    } catch (err) {
      toast.error(err?.message || "Failed to delete account record.");
    } finally {
      handleClose();
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      backdrop="static"
      keyboard={false}
      className="custom-skip-modal"
    >
      <Modal.Body className="p-4 text-center">
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "#fee2e2",
            color: "#dc2626",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <ExclamationTriangleIcon style={{ width: 32, height: 32 }} />
        </div>

        <h4 className="fw-bold text-slate-900 mb-2" style={{ fontSize: 19 }}>
          {isBulkDelete ? "Delete All Member Accounts?" : "Delete Member Account?"}
        </h4>

        <p className="text-muted mb-4" style={{ fontSize: 14, lineHeight: 1.5 }}>
          {isBulkDelete
            ? "Are you sure you want to delete all member loan records from the database? This permanent action cannot be undone."
            : "Are you sure you want to delete this member's loan record? This action cannot be reversed."}
        </p>

        <div className="d-flex justify-content-center gap-2">
          <Button
            variant="light"
            onClick={handleClose}
            style={{
              padding: "9px 20px",
              borderRadius: 10,
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            style={{
              padding: "9px 22px",
              borderRadius: 10,
              fontWeight: 600,
              fontSize: 14,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <TrashIcon style={{ width: 16, height: 16 }} />
            {isBulkDelete ? "Yes, Delete All" : "Delete Account"}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

AccountsDeleteModal.propTypes = {
  show: PropTypes.bool.isRequired,
  id: PropTypes.string,
  handleClose: PropTypes.func.isRequired,
  getLoansDetails: PropTypes.func.isRequired,
  skip: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default AccountsDeleteModal;
