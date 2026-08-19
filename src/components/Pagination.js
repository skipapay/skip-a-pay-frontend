import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import useQuery from "hooks/useQuery";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/outline";
import "./style/customPagination.scss";

const CustomPagination = ({ count, className, currentPage, onPageChange }) => {
  const query = useQuery();
  const navigate = useNavigate();
  const urlPage = parseInt(query.get("skip")) || 1;
  const activePage = currentPage !== undefined ? Number(currentPage) : urlPage;
  const totalPages = Math.max(1, Number(count) || 1);

  const goToPage = (p) => {
    if (p < 1 || p > totalPages || p === activePage) return;
    if (onPageChange) {
      onPageChange(p);
    } else {
      const q = new URLSearchParams(window.location.search);
      q.set("skip", p);
      navigate(`?${q.toString()}`);
    }
  };

  // Generate page numbers with responsive ellipsis
  const getVisiblePages = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (activePage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }

    if (activePage >= totalPages - 3) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, "...", activePage - 1, activePage, activePage + 1, "...", totalPages];
  };

  if (totalPages <= 1) return null;

  const pages = getVisiblePages();

  return (
    <div className={`modern-pagination-container ${className || ""}`}>
      {/* First Page */}
      <button
        type="button"
        className="pagination-nav-btn"
        onClick={() => goToPage(1)}
        disabled={activePage === 1}
        title="First Page"
      >
        <ChevronDoubleLeftIcon className="nav-icon" />
      </button>

      {/* Prev Page */}
      <button
        type="button"
        className="pagination-nav-btn"
        onClick={() => goToPage(activePage - 1)}
        disabled={activePage === 1}
        title="Previous Page"
      >
        <ChevronLeftIcon className="nav-icon" />
      </button>

      {/* Page Numbers */}
      <div className="pagination-numbers">
        {pages.map((p, idx) =>
          p === "..." ? (
            <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
              •••
            </span>
          ) : (
            <button
              key={`page-${p}`}
              type="button"
              className={`pagination-num-btn ${activePage === p ? "is-active" : ""}`}
              onClick={() => goToPage(p)}
            >
              {p}
            </button>
          )
        )}
      </div>

      {/* Next Page */}
      <button
        type="button"
        className="pagination-nav-btn"
        onClick={() => goToPage(activePage + 1)}
        disabled={activePage >= totalPages}
        title="Next Page"
      >
        <ChevronRightIcon className="nav-icon" />
      </button>

      {/* Last Page */}
      <button
        type="button"
        className="pagination-nav-btn"
        onClick={() => goToPage(totalPages)}
        disabled={activePage >= totalPages}
        title="Last Page"
      >
        <ChevronDoubleRightIcon className="nav-icon" />
      </button>
    </div>
  );
};

CustomPagination.propTypes = {
  count: PropTypes.number.isRequired,
  className: PropTypes.string,
  currentPage: PropTypes.number,
  onPageChange: PropTypes.func,
};

export default CustomPagination;
