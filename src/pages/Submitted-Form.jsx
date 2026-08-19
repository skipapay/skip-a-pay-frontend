import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactTable from "components/Table";
import submittedApplications from "api/admin/users";
import { Button, Dropdown, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { setSubmittedFormsCount } from "features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useQuery from "hooks/useQuery";
import formDownload from "api/user/downloadForm";
import { saveAs } from "file-saver";
import moment from "moment";
import SubmitFormDeleteModal from "components/SubmitFormDeleteModal";
import CustomPagination from "components/Pagination";
import {
  DocumentCheckIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  CalendarDaysIcon,
  InboxIcon,
} from "@heroicons/react/24/outline";
import "./submittedForm.scss";

const SubmittedForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const query = useQuery();
  const toastId = useRef(null);

  const skip = parseInt(query.get("skip")) || 1;
  const limit = parseInt(query.get("limit")) || 10;
  const daysParam = query.get("days");
  const searchParam = query.get("search");

  const [isLoading, setIsLoading] = useState(true);
  const [submittedForm, setSubmittedForm] = useState([]);
  const [searchInput, setSearchInput] = useState(searchParam || "");
  const [activeDaysFilter, setActiveDaysFilter] = useState(
    daysParam ? Number(daysParam) : 0
  );

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState("");

  const filterOptions = [
    { label: "All Time", value: 0 },
    { label: "Last 7 Days", value: 7 },
    { label: "Last 14 Days", value: 14 },
    { label: "Last 30 Days", value: 30 },
  ];

  const pageSizeOptions = [10, 25, 50, 100];

  const getAllUsers = async (params = {}) => {
    try {
      setIsLoading(true);
      const queryPayload = { ...params, limit: params.limit || limit };
      let applications = await submittedApplications(queryPayload);
      dispatch(
        setSubmittedFormsCount({
          count: applications.data?.count,
        })
      );
      setSubmittedForm(applications.data?.users || []);
    } catch (err) {
      toast.error(err?.message || "Failed to retrieve submitted applications.");
    } finally {
      setIsLoading(false);
    }
  };

  const totalCount = useSelector((state) => state.auth.submittedFormsCount[0]) || 0;
  const pageCount = Math.ceil(totalCount / limit);

  // Handle rows per page limit change
  const handleLimitChange = (e) => {
    const newLimit = Number(e.target.value);
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set("limit", newLimit);
    queryParams.set("skip", 1); // Reset to first page
    navigate(`?${queryParams.toString()}`);
  };

  // Page jumper
  const handleChangePageNumber = (event) => {
    const targetPage = Number(event.target.value);
    if (targetPage >= 1 && targetPage <= pageCount) {
      const queryParams = new URLSearchParams(window.location.search);
      queryParams.set("skip", targetPage);
      navigate(`?${queryParams.toString()}`);
    }
  };

  useEffect(() => {
    let queryParams = {};

    if (skip) queryParams["skip"] = skip;
    if (limit) queryParams["limit"] = limit;
    if (searchParam) {
      queryParams["search"] = searchParam;
      setSearchInput(searchParam);
    }
    if (daysParam) {
      queryParams["days"] = daysParam;
      setActiveDaysFilter(Number(daysParam));
    } else {
      setActiveDaysFilter(0);
    }

    getAllUsers(queryParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Filter by timeframe
  const handleFilter = (days) => {
    const queryParams = new URLSearchParams();
    const searchQuery = query.get("search");

    if (days && days > 0) {
      queryParams.set("days", days);
    }
    if (searchQuery) {
      queryParams.set("search", searchQuery);
    }
    if (limit && limit !== 10) {
      queryParams.set("limit", limit);
    }
    queryParams.set("skip", 1);

    const qs = queryParams.toString();
    navigate(qs ? `?${qs}` : window.location.pathname);
  };

  // Search with debounce
  let searchTimeout = useRef(null);
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(() => {
      const queryParams = new URLSearchParams();
      const currentDays = query.get("days");

      if (val.trim()) {
        queryParams.set("search", val.trim());
      }
      if (currentDays) {
        queryParams.set("days", currentDays);
      }
      if (limit && limit !== 10) {
        queryParams.set("limit", limit);
      }
      queryParams.set("skip", 1);

      const qs = queryParams.toString();
      navigate(qs ? `?${qs}` : window.location.pathname);
    }, 600);
  };

  // Download all or filtered forms in CSV format
  const handleDownload = async (days) => {
    let param = days ? { days } : { days: null };
    let msg = days
      ? `Last ${days} days data downloaded.`
      : "All application data downloaded.";

    toastId.current = toast.loading("Preparing CSV export...", {
      autoClose: false,
      closeOnClick: false,
    });

    try {
      let downloadRes = await formDownload(param);
      if (downloadRes.status === 200) {
        let fileName = days ? `skip-applications-${days}-days.csv` : "all-skip-applications.csv";
        saveAs(downloadRes.data, fileName);
        toast.update(toastId.current, {
          render: msg,
          type: "success",
          isLoading: false,
          autoClose: 5000,
          closeButton: true,
          closeOnClick: true,
        });
      } else {
        toast.update(toastId.current, {
          render: downloadRes.message || "Failed to download export file.",
          type: "error",
          isLoading: false,
          autoClose: 5000,
          closeButton: true,
          closeOnClick: true,
        });
      }
    } catch (err) {
      toast.update(toastId.current, {
        render: err?.message || "Export download failed.",
        type: "error",
        isLoading: false,
        autoClose: 5000,
        closeButton: true,
        closeOnClick: true,
      });
    }
  };

  // Trigger single or bulk delete
  const handleDeleteClick = (id) => {
    setDeleteId(id || "");
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const data = useMemo(() => submittedForm, [submittedForm]);

  // Enhanced Table Columns
  const columns = useMemo(
    () => [
      {
        Header: "Member Applicant",
        accessor: "firstName",
        Cell: ({ row }) => {
          const item = row.original;
          const fullName = [item.firstName, item.middleName, item.lastName]
            .filter(Boolean)
            .join(" ");
          const initials = [item.firstName?.[0], item.lastName?.[0]]
            .filter(Boolean)
            .join("")
            .toUpperCase() || "MB";

          return (
            <div className="member-cell">
              <div className="member-avatar-badge">{initials}</div>
              <div className="member-details">
                <span className="member-name">{fullName}</span>
                <span className="member-email">{item.email}</span>
              </div>
            </div>
          );
        },
      },
      {
        Header: "Account Number",
        accessor: "accountNumber",
        Cell: ({ value }) => (
          <span className="fw-semibold text-slate-800" style={{ fontFamily: "monospace", fontSize: 13.5 }}>
            {value || "—"}
          </span>
        ),
      },
      {
        Header: "Portal",
        accessor: "website",
        Cell: ({ value }) => {
          const site = (value || "").toLowerCase();
          const badgeClass =
            site === "cpfcu"
              ? "portal-cpfcu"
              : site === "npcu"
              ? "portal-npcu"
              : "portal-generic";
          return <span className={`portal-badge ${badgeClass}`}>{value || "DIRECT"}</span>;
        },
      },
      {
        Header: "Skipped Loan(s)",
        accessor: "loan",
        Cell: ({ value }) => {
          if (!Array.isArray(value) || value.length === 0) {
            return <span className="text-muted">—</span>;
          }
          return (
            <div className="loan-chip-container">
              {value.map((loanObj, idx) => (
                <span key={loanObj._id || idx} className="loan-chip" title={loanObj.loan_type}>
                  #{loanObj.loan_id || loanObj._id}
                </span>
              ))}
            </div>
          );
        },
      },
      {
        Header: "Submission Date",
        accessor: "createdAt",
        Cell: ({ value }) => (
          <span className="date-cell">
            {value ? moment(value).format("MMM DD, YYYY • hh:mm A") : "—"}
          </span>
        ),
      },
      {
        Header: "Action",
        accessor: "_id",
        Cell: ({ value }) => (
          <button
            type="button"
            className="btn-row-delete"
            title="Delete Application"
            onClick={() => handleDeleteClick(value)}
          >
            <TrashIcon className="row-trash-icon" />
          </button>
        ),
      },
    ],
    []
  );

  // Pagination calculation stats
  const startItem = totalCount > 0 ? (skip - 1) * limit + 1 : 0;
  const endItem = Math.min(skip * limit, totalCount);

  return (
    <div className="submitted-form-page">
      {/* 1. Header Card */}
      <div className="page-header-card">
        <div className="header-top-row">
          <div className="header-title-group">
            <div className="header-icon-box">
              <DocumentCheckIcon className="header-icon" />
            </div>
            <div>
              <h1 className="title-text">Submitted Applications</h1>
              <p className="subtitle-text">
                Review member skip-a-payment requests, filter timeframes, and export reports.
              </p>
            </div>
          </div>

          <div className="header-action-group">
            {!isLoading && data.length > 0 && (
              <button
                type="button"
                className="btn-delete-all"
                onClick={() => handleDeleteClick("")}
              >
                <TrashIcon className="btn-trash-icon" />
                <span>Delete All Records</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Filter & Search Toolbar */}
      <div className="toolbar-card">
        <div className="toolbar-row">
          {/* Search Box */}
          <div className="search-box-wrapper">
            <MagnifyingGlassIcon className="search-icon" />
            <input
              type="text"
              className="search-input-field"
              placeholder="Search by name, account #, or email..."
              value={searchInput}
              onChange={handleSearchChange}
            />
          </div>

          {/* Timeframe Filter Pills */}
          <div className="filter-pills-group">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`filter-pill-btn ${activeDaysFilter === opt.value ? "active" : ""}`}
                onClick={() => handleFilter(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Export Dropdown */}
          <div className="export-dropdown">
            <Dropdown align="end">
              <Dropdown.Toggle className="export-toggle-btn">
                <ArrowDownTrayIcon className="export-icon" />
                <span>Export CSV</span>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item onClick={() => handleDownload(0)}>
                  All Application Records (.CSV)
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={() => handleDownload(7)}>
                  Last 7 Days Only (.CSV)
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleDownload(14)}>
                  Last 14 Days Only (.CSV)
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleDownload(30)}>
                  Last 30 Days Only (.CSV)
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </div>

      {/* 3. Table Container Card */}
      <div className="table-card">
        {isLoading ? (
          <div className="text-center py-5">
            <Spinner animation="border" style={{ color: "var(--primary, #030359)" }} role="status" />
            <p className="text-muted mt-2 mb-0" style={{ fontSize: 13 }}>
              Loading applications...
            </p>
          </div>
        ) : data.length > 0 ? (
          <>
            <div className="table-responsive-wrapper">
              <ReactTable data={data} columns={columns} />
            </div>

            {/* Pagination Controls Footer */}
            <div className="table-pagination-footer">
              <div className="footer-left-controls">
                {/* Rows per page dropdown */}
                <div className="rows-per-page-group">
                  <span>Show</span>
                  <select
                    className="rows-select-custom"
                    value={limit}
                    onChange={handleLimitChange}
                  >
                    {pageSizeOptions.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                  <span>per page</span>
                </div>

                <span className="results-count-text">
                  Showing <strong>{startItem}</strong>-<strong>{endItem}</strong> of{" "}
                  <strong>{totalCount}</strong> applications
                </span>
              </div>

              <div className="footer-right-controls">
                <CustomPagination count={pageCount} />

                {pageCount > 1 && (
                  <div className="page-jump-box d-none d-sm-flex">
                    <span>Jump to:</span>
                    <input
                      type="number"
                      min={1}
                      max={pageCount}
                      placeholder="Page"
                      className="jump-input"
                      onChange={handleChangePageNumber}
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state-container">
            <div className="empty-icon-circle">
              <InboxIcon className="empty-icon" />
            </div>
            <h3 className="empty-title">No Applications Found</h3>
            <p className="empty-desc">
              {searchInput || activeDaysFilter > 0
                ? "No submission records match your active search criteria or timeframe filter."
                : "No member applications have been submitted for this Skip-A-Payment campaign yet."}
            </p>
          </div>
        )}
      </div>

      {/* 4. Delete Confirmation Modal */}
      <SubmitFormDeleteModal
        getAllUsers={getAllUsers}
        skip={skip}
        id={deleteId}
        show={showDeleteModal}
        handleClose={handleCloseDeleteModal}
      />
    </div>
  );
};

export default SubmittedForm;
