import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { useDropzone } from "react-dropzone";
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import PropTypes from "prop-types";
import "./style/fileUpload.scss";

const FileUpload = React.forwardRef(
  ({ name, setFieldValue, multiple, supportedFile }, ref) => {
    const [acceptedFiles, setAcceptedFiles] = useState(multiple ? [] : null);

    const onDrop = useCallback(
      (files) => {
        if (multiple) {
          setAcceptedFiles((prevFiles) => [...prevFiles, ...files]);
        } else {
          setAcceptedFiles(files[0] || null);
        }
      },
      [multiple]
    );

    useEffect(() => {
      setFieldValue(name, acceptedFiles);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [acceptedFiles]);

    const {
      getRootProps,
      getInputProps,
      isDragAccept,
      isDragReject,
      isDragActive,
    } = useDropzone({
      accept: {
        "text/csv": [".csv"],
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
        "application/vnd.ms-excel": [".xls"],
      },
      onDrop,
      multiple,
    });

    const handleDelete = (file) => {
      setAcceptedFiles((prevFiles) => {
        if (multiple) {
          return prevFiles.filter((f) => f !== file);
        } else {
          return null;
        }
      });
      setFieldValue(name, multiple ? [] : null);
    };

    useImperativeHandle(ref, () => ({
      handleClear() {
        setAcceptedFiles(multiple ? [] : null);
      },
    }));

    const formatFileSize = (bytes) => {
      if (!bytes) return "0 Bytes";
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    const renderedFiles = multiple
      ? acceptedFiles.map((file, idx) => (
          <li key={file.path || idx} className="file-preview-card">
            <div className="file-info-group">
              <div className="file-type-icon-box">
                <DocumentTextIcon className="doc-icon" />
              </div>
              <div className="file-meta">
                <span className="file-name-text">{file.name || file.path}</span>
                <span className="file-size-text">{formatFileSize(file.size)}</span>
              </div>
            </div>
            <button
              type="button"
              className="btn-remove-file"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(file);
              }}
              title="Remove file"
            >
              <XMarkIcon className="remove-icon" />
            </button>
          </li>
        ))
      : acceptedFiles && (
          <li key={acceptedFiles.path || "single-file"} className="file-preview-card">
            <div className="file-info-group">
              <div className="file-type-icon-box">
                <DocumentTextIcon className="doc-icon" />
              </div>
              <div className="file-meta">
                <span className="file-name-text">{acceptedFiles.name || acceptedFiles.path}</span>
                <span className="file-size-text">{formatFileSize(acceptedFiles.size)}</span>
              </div>
            </div>
            <button
              type="button"
              className="btn-remove-file"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(acceptedFiles);
              }}
              title="Remove file"
            >
              <XMarkIcon className="remove-icon" />
            </button>
          </li>
        );

    return (
      <div className="modern-dropzone">
        <div
          {...getRootProps()}
          className={`dropzone-area ${
            isDragActive ? (isDragReject ? "is-drag-reject" : "is-drag-active") : ""
          }`}
        >
          <input {...getInputProps()} name={name} />
          <div className="dropzone-icon-box">
            <CloudArrowUpIcon className="upload-cloud-icon" />
          </div>

          <h4 className="dropzone-prompt-title">
            {isDragActive
              ? isDragReject
                ? "File type not supported"
                : "Drop your file here to upload..."
              : "Choose a file or drag & drop it here"}
          </h4>

          <p className="dropzone-prompt-desc">
            Supports standardized member loan spreadsheets
          </p>

          <div className="supported-badges">
            {supportedFile.map((ext, idx) => (
              <span key={idx} className="format-badge">
                {ext.toUpperCase()}
              </span>
            ))}
          </div>
        </div>

        {/* Selected files preview */}
        {acceptedFiles && (Array.isArray(acceptedFiles) ? acceptedFiles.length > 0 : true) && (
          <ul className="files-preview-list">{renderedFiles}</ul>
        )}
      </div>
    );
  }
);

FileUpload.propTypes = {
  name: PropTypes.string.isRequired,
  setFieldValue: PropTypes.func.isRequired,
  multiple: PropTypes.bool,
  supportedFile: PropTypes.array,
};

FileUpload.defaultProps = {
  name: "file",
  multiple: false,
  supportedFile: [".csv", ".xlsx"],
};

export default FileUpload;
