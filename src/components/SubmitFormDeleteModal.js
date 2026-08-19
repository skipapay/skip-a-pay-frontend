import React from "react";
import PropTypes from "prop-types";
import { Modal, Button } from "react-bootstrap";
import handleDeleteUsers from "api/user/deleteUser";
import { toast } from "react-toastify";
import { ExclamationTriangleIcon, TrashIcon } from "@heroicons/react/24/outline";

const SubmitFormDeleteModal = ({
  show,
  id = "",
  handleClose,
  getAllUsers,
  skip,
}) => {
  const isBulkDelete = !id;

  const handleDelete = async () => {
    try {
      let response = await handleDeleteUsers(id);
      if (response?.data?.acknowledged && response?.status === 202) {
        if (response?.data?.acknowledged > 1) {
          toast.success("All submitted forms have been deleted successfully.");
        } else {
          toast.success("Submitted application deleted successfully.");
        }
        getAllUsers({ skip });
      } else {
        if (response?.status === 500) {
          toast.error(response.message);
        } else {
          toast.error("Application record not found.");
        }
      }
    } catch (err) {
      toast.error(err?.message || "Failed to delete record.");
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
          {isBulkDelete ? "Delete All Submissions?" : "Delete Application Record?"}
        </h4>

        <p className="text-muted mb-4" style={{ fontSize: 14, lineHeight: 1.5 }}>
          {isBulkDelete
            ? "Are you sure you want to delete all submitted skip applications? This permanent action cannot be undone."
            : "Are you sure you want to delete this member's skip payment application? This action cannot be reversed."}
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
            {isBulkDelete ? "Yes, Delete All" : "Delete Record"}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

SubmitFormDeleteModal.propTypes = {
  show: PropTypes.bool.isRequired,
  id: PropTypes.string,
  handleClose: PropTypes.func.isRequired,
  getAllUsers: PropTypes.func.isRequired,
  skip: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default SubmitFormDeleteModal;
