import React, { useRef } from "react";
import FileUpload from "components/FileUpload";
import { Formik } from "formik";
import { Button, Form, Row, Col, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import axios from "util/axios";
import * as yup from "yup";
import {
  CloudArrowUpIcon,
  CheckCircleIcon,
  TableCellsIcon,
} from "@heroicons/react/24/outline";
import "./settings.scss";

const Settings = () => {
  const toastId = useRef(null);
  const fileUploadRef = useRef();

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    toastId.current = toast.loading("Uploading loan roster and processing records...", {
      autoClose: false,
      closeOnClick: false,
    });

    axios
      .post("/loans", values, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        toast.update(toastId.current, {
          render: "Loan roster uploaded and synced successfully!",
          type: "success",
          isLoading: false,
          autoClose: 5000,
          closeButton: true,
          closeOnClick: true,
        });
        resetForm();
        if (fileUploadRef.current?.handleClear) {
          fileUploadRef.current.handleClear();
        }
      })
      .catch((err) => {
        console.error(err);
        toast.update(toastId.current, {
          render: err?.response?.data?.error || "Failed to upload loan file.",
          type: "error",
          isLoading: false,
          autoClose: 5000,
          closeButton: true,
          closeOnClick: true,
        });
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const schema = yup.object().shape({
    loan: yup.mixed().required("Please choose a CSV or Excel file to upload."),
  });

  return (
    <div className="settings-page">
      {/* 1. Header Card */}
      <div className="page-header-card">
        <div className="header-top-row">
          <div className="header-title-group">
            <div className="header-icon-box">
              <CloudArrowUpIcon className="header-icon" />
            </div>
            <div>
              <h1 className="title-text">Loan Data Ingestion & Settings</h1>
              <p className="subtitle-text">
                Upload member loan rosters to update eligible accounts for active Skip A Pay campaigns.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Side-by-Side Upload & Schema Specification Layout */}
      <Row className="g-4">
        {/* Left Column: File Dropzone & Upload Action */}
        <Col xs={12} lg={6}>
          <div className="settings-content-card">
            <div className="card-heading-row">
              <CloudArrowUpIcon className="card-heading-icon" />
              <h2 className="card-heading-title">Upload Loan File</h2>
            </div>
            <p className="card-heading-desc">
              Select or drag your member loan file. Uploading new files appends and syncs eligible account records.
            </p>

            <Formik
              initialValues={{ loan: "" }}
              validationSchema={schema}
              onSubmit={handleSubmit}
            >
              {({ handleSubmit, setFieldValue, isSubmitting, errors }) => (
                <Form onSubmit={handleSubmit} className="d-flex flex-column flex-1">
                  <FileUpload
                    name="loan"
                    setFieldValue={setFieldValue}
                    supportedFile={[".csv", ".xlsx", ".xls"]}
                    ref={fileUploadRef}
                  />

                  {errors.loan && (
                    <div className="text-danger mt-2 fw-semibold" style={{ fontSize: 13 }}>
                      {errors.loan}
                    </div>
                  )}

                  <div className="mt-auto pt-3">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-upload-submit"
                    >
                      {isSubmitting ? (
                        <>
                          <Spinner size="sm" animation="border" className="me-2" />
                          Processing & Ingesting...
                        </>
                      ) : (
                        <>
                          <CloudArrowUpIcon className="upload-btn-icon" />
                          <span>Ingest & Sync Loan Records</span>
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </Col>

        {/* Right Column: File Format Guidelines & Template Specification */}
        <Col xs={12} lg={6}>
          <div className="settings-content-card">
            <div className="card-heading-row">
              <TableCellsIcon className="card-heading-icon" />
              <h2 className="card-heading-title">Required File Format Specification</h2>
            </div>
            <p className="card-heading-desc">
              To ensure seamless ingestion, your spreadsheet headers must match the column schema below:
            </p>

            <div className="table-responsive">
              <table className="schema-guide-table">
                <thead>
                  <tr>
                    <th>Column Header</th>
                    <th>Type</th>
                    <th>Example</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>loan_id</td>
                    <td>Text / ID</td>
                    <td>LOAN-84920</td>
                  </tr>
                  <tr>
                    <td>name</td>
                    <td>String</td>
                    <td>Jane Smith</td>
                  </tr>
                  <tr>
                    <td>account_number</td>
                    <td>Numeric / Text</td>
                    <td>9028174</td>
                  </tr>
                  <tr>
                    <td>loan_type</td>
                    <td>String</td>
                    <td>Auto Loan</td>
                  </tr>
                  <tr>
                    <td>Description</td>
                    <td>String</td>
                    <td>2023 Tesla Model 3</td>
                  </tr>
                  <tr>
                    <td>last_ssn_digits</td>
                    <td>String (3-4 digits)</td>
                    <td>4920</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="guide-tip-box mt-3">
              <CheckCircleIcon className="tip-icon" />
              <div>
                <strong>Pro Tip:</strong> Files formatted in UTF-8 CSV or standard Excel (.xlsx) process instantly. Existing accounts will be updated while maintaining previous submission histories.
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Settings;
