import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactTable from "components/Table";
import { Button, Spinner } from "react-bootstrap";
import CustomPagination from "components/Pagination";
import AccountsDeleteModal from "components/AccountDeleteModal";
import { getLoans } from "api/admin/loans";
import useQuery from "hooks/useQuery";
import { useDispatch, useSelector } from "react-redux";
import { setAccountsCount } from "features/auth/authSlice";
import {
  UserGroupIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  CircleStackIcon,
  UserCircleIcon,
  IdentificationIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./totalAccounts.scss";

const TotalAccounts = () => {
  const navigate = useNavigate();
  const query = useQuery();
  const dispatch = useDispatch();

  const skip = parseInt(query.get("skip")) || 1;
  const limit = parseInt(query.get("limit")) || 10;
  const searchParam = query.get("search");

  const [isLoading, setIsLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [searchInput, setSearchInput] = useState(searchParam || "");

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState("");

  const pageSizeOptions = [10, 25, 50, 100];

  const getLoansDetails = async (params = {}) => {
    try {
      setIsLoading(true);
      const queryPayload = { ...params, limit: params.limit || limit };
      let applications = await getLoans(queryPayload);
      dispatch(setAccountsCount(applications.data?.count || 0));
      setAccounts(applications.data?.loans || []);
    } catch (err) {
      toast.error(err?.message || "Failed to retrieve member loan accounts.");
    } finally {
      setIsLoading(false);
    }
  };

  const totalCount = useSelector((state) => state.auth.accountsCount) || 0;
  const pageCount = Math.ceil(totalCount / limit);

  // Rows per page limit change
  const handleLimitChange = (e) => {
    const newLimit = Number(e.target.value);
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set("limit", newLimit);
    queryParams.set("skip", 1);
    navigate(`?${queryParams.toString()}`);
  };

  // Jump to page
  const handleChangePageNumber = (event) => {
    const targetPage = Number(event.target.value);
    if (targetPage >= 1 && targetPage <= pageCount) {
      const queryParams = new URLSearchParams(window.location.search);
      queryParams.set("skip", targetPage);
      navigate(`?${queryParams.toString()}`);
    }
  };

  useEffect(() => {
    let queryParam = {};
    if (searchParam) {
      queryParam["search"] = searchParam;
      setSearchInput(searchParam);
    }
    if (skip) queryParam["skip"] = skip;
    if (limit) queryParam["limit"] = limit;

    getLoansDetails(queryParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Search input handler with debounce
  let searchTimeout = useRef(null);
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(() => {
      const queryParams = new URLSearchParams();
      if (val.trim()) {
        queryParams.set("search", val.trim());
      }
      if (limit && limit !== 10) {
        queryParams.set("limit", limit);
      }
      queryParams.set("skip", 1);

      const qs = queryParams.toString();
      navigate(qs ? `?${qs}` : window.location.pathname);
    }, 600);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id || "");
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const data = useMemo(() => accounts, [accounts]);

  // Enhanced Columns for Total Accounts
  const columns = useMemo(
    () => [
      {
        Header: "Loan ID",
        accessor: "loan_id",
        Cell: ({ value, row }) => (
          <span className="loan-chip" style={{ fontSize: 12 }}>
            #{value || row.original._id}
          </span>
        ),
      },
      {
        Header: "Member Account",
        accessor: "name",
        Cell: ({ value, row }) => {
          const item = row.original;
          const fullName = value || item.name || "Member Account";
          const initials = (fullName || "")
            .split(" ")
            .map((n) => n[0])
            .filter(Boolean)
            .join("")
            .toUpperCase() || "MB";

          return (
            <div className="member-cell">
              <div className="member-avatar-badge">{initials}</div>
              <div className="member-details">
                <span className="member-name">{fullName}</span>
                {item.email ? (
                  <span className="member-email">{item.email}</span>
                ) : (
                  <span className="member-email" style={{ color: "#94a3b8" }}>
                    Account #{item.account_number || "—"}
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        Header: "Account Number",
        accessor: "account_number",
        Cell: ({ value }) => (
          <div className="d-flex align-items-center gap-2">
            <span className="account-num-text">{value || "—"}</span>
            {value && (
              <button
                type="button"
                className="btn p-0 border-0 text-muted"
                title="Copy Account Number"
                style={{ lineHeight: 1 }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(value);
                  toast.info(`Account #${value} copied to clipboard!`, { autoClose: 2000 });
                }}
              >
                <DocumentDuplicateIcon style={{ width: 14, height: 14 }} />
              </button>
            )}
          </div>
        ),
      },
      {
        Header: "Loan Type",
        accessor: "loan_type",
        Cell: ({ value }) => <span className="loan-type-pill">{value || "General Loan"}</span>,
      },
      {
        Header: "Description",
        accessor: "Description",
        Cell: ({ value, row }) => (
          <span className="text-slate-600" style={{ fontSize: 13, maxWidth: 220, display: "inline-block" }}>
            {value || row.original.description || "—"}
          </span>
        ),
      },
      {
        Header: "Last 4 SSN",
        accessor: "last_ssn_digits",
        Cell: ({ value }) => (
          <span className="text-muted fw-semibold" style={{ letterSpacing: 0.5 }}>
            {value ? `•••• •• ${value}` : "—"}
          </span>
        ),
      },
      {
        Header: "Uploader",
        accessor: "owner.name",
        Cell: ({ value }) => (
          <span className="uploader-badge">
            <UserCircleIcon style={{ width: 14, height: 14 }} />
            {value || "System"}
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
            title="Delete Account Record"
            onClick={() => handleDeleteClick(value)}
          >
            <TrashIcon className="row-trash-icon" />
          </button>
        ),
      },
    ],
    []
  );

  const startItem = totalCount > 0 ? (skip - 1) * limit + 1 : 0;
  const endItem = Math.min(skip * limit, totalCount);

  return (
    <div className="total-accounts-page">
      {/* 1. Header Card */}
      <div className="page-header-card">
        <div className="header-top-row">
          <div className="header-title-group">
            <div className="header-icon-box">
              <UserGroupIcon className="header-icon" />
            </div>
            <div>
              <h1 className="title-text">Member Accounts Directory</h1>
              <p className="subtitle-text">
                Browse eligible member loan files, verify account numbers, and manage database records.
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
                <span>Delete All Accounts</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Search Toolbar */}
      <div className="toolbar-card">
        <div className="search-box-wrapper">
          <MagnifyingGlassIcon className="search-icon" />
          <input
            type="text"
            className="search-input-field"
            placeholder="Search by member name, account #, or loan ID..."
            value={searchInput}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* 3. Table Card */}
      <div className="table-card">
        {isLoading ? (
          <div className="text-center py-5">
            <Spinner animation="border" style={{ color: "var(--primary, #030359)" }} role="status" />
            <p className="text-muted mt-2 mb-0" style={{ fontSize: 13 }}>
              Loading member accounts...
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
                  <strong>{totalCount}</strong> accounts
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
              <CircleStackIcon className="empty-icon" />
            </div>
            <h3 className="empty-title">No Member Accounts Found</h3>
            <p className="empty-desc">
              {searchInput
                ? "No member accounts match your active search query."
                : "No loan accounts are currently loaded. Upload a CSV/Excel file in Settings to populate accounts."}
            </p>
          </div>
        )}
      </div>

      {/* 4. Delete Confirmation Modal */}
      <AccountsDeleteModal
        getLoansDetails={getLoansDetails}
        skip={skip}
        id={deleteId}
        show={showDeleteModal}
        handleClose={handleCloseDeleteModal}
      />
    </div>
  );
};

export default TotalAccounts;
