import React, { useEffect, useState } from "react";
import IconCard from "sections/dashboard/IconCard";
import {
  BanknotesIcon,
  CalendarDaysIcon,
  DocumentArrowDownIcon,
  UserGroupIcon,
  ArrowPathIcon,
  ArrowRightIcon,
  ClockIcon,
  DocumentCheckIcon,
  CloudArrowUpIcon,
  CircleStackIcon,
} from "@heroicons/react/24/outline";
import { Col, Row, Button } from "react-bootstrap";
import submittedApplications from "api/admin/users";
import { getLoans } from "api/admin/loans";
import { useDispatch, useSelector } from "react-redux";
import {
  setAccountsCount,
  setSubmittedFormsCount,
} from "features/auth/authSlice";
import { Link, useNavigate } from "react-router-dom";
import moment from "moment";
import "./dashboard.scss";

const Dashboard = () => {
  const { submittedFormsCount: loanCount = [0, 0], accountsCount = 0, user } = useSelector(
    (state) => state.auth
  );

  const [isRefreshing, setIsRefreshing] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getData = async () => {
    try {
      setIsRefreshing(true);
      const [applications, accountsRes] = await Promise.all([
        submittedApplications({ count: true, days: 7 }),
        getLoans({ count: true }),
      ]);

      // store counts in Redux
      if (accountsRes?.data?.count !== undefined) {
        dispatch(setAccountsCount(accountsRes.data.count));
      }
      if (applications?.data) {
        dispatch(
          setSubmittedFormsCount({
            count: applications.data.count ?? 0,
            daysCount: applications.data.daysCount ?? 0,
          })
        );
      }
    } catch (error) {
      console.error("Failed to refresh dashboard counts:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const adminName = user?.name || "Administrator";
  const currentDate = moment().format("dddd, MMMM DD, YYYY");

  return (
    <div className="dashboard-container">
      {/* 1. Executive Welcome & Quick Actions Banner */}
      <div className="dashboard-hero-banner">
        <Row className="align-items-center g-3">
          <Col xs={12} lg={8} className="banner-content">
            <div className="banner-date-badge">
              <ClockIcon className="date-icon" />
              <span>{currentDate}</span>
            </div>
            <h1 className="banner-title">Welcome back, {adminName} 👋</h1>
            <p className="banner-subtitle">
              Here is your latest Skip A Pay campaign summary, active loan rosters, and submission analytics.
            </p>
          </Col>

          <Col xs={12} lg={4} className="banner-actions justify-content-lg-end">
            <Button
              className="btn-banner-action btn-secondary-action"
              onClick={getData}
              disabled={isRefreshing}
            >
              <ArrowPathIcon className={`btn-icon ${isRefreshing ? "spin-animation" : ""}`} />
              <span>{isRefreshing ? "Updating..." : "Refresh"}</span>
            </Button>
            <Button
              className="btn-banner-action btn-primary-action"
              onClick={() => navigate("/submitted-form")}
            >
              <span>View Submissions</span>
              <ArrowRightIcon className="btn-icon" />
            </Button>
          </Col>
        </Row>
      </div>

      {/* 2. Key Metric KPI Cards Grid */}
      <div className="mb-4">
        <div className="section-title-row">
          <h2 className="section-main-title">Campaign Performance Overview</h2>
          <span className="section-subtitle">Real-time telemetry</span>
        </div>

        <Row className="g-3">
          {/* Metric 1: Total Accounts */}
          <Col xs={12} sm={6} xl={3}>
            <IconCard
              title="Total Accounts"
              subtitle={Number(accountsCount).toLocaleString()}
              icon={UserGroupIcon}
              variant="blue"
              badgeText="Member Roster"
              description="Active loan accounts loaded in system"
              to="/total-accounts"
            />
          </Col>

          {/* Metric 2: Total Loans Applied */}
          <Col xs={12} sm={6} xl={3}>
            <IconCard
              title="Total Skip Requests"
              subtitle={Number(loanCount?.[0] || 0).toLocaleString()}
              icon={BanknotesIcon}
              variant="purple"
              badgeText="All-Time"
              description="Submitted member skip applications"
              to="/submitted-form"
            />
          </Col>

          {/* Metric 3: Recent 7-Day Velocity */}
          <Col xs={12} sm={6} xl={3}>
            <IconCard
              title="Recent Volume"
              smallTitle="(7 Days)"
              subtitle={Number(loanCount?.[1] || 0).toLocaleString()}
              icon={CalendarDaysIcon}
              variant="emerald"
              badgeText="Weekly Pace"
              description="Applications submitted in last 7 days"
              to="/submitted-form?days=7"
            />
          </Col>

          {/* Metric 4: Direct Export Reports */}
          <Col xs={12} sm={6} xl={3}>
            <IconCard
              title="Data Export"
              subtitle="CSV Report"
              icon={DocumentArrowDownIcon}
              variant="indigo"
              badgeText="One-Click"
              description="Download complete submission records"
              to="/submitted-form"
            />
          </Col>
        </Row>
      </div>

      {/* 3. Operational Hub & Management Shortcuts */}
      <div className="mt-4">
        <div className="section-title-row">
          <h2 className="section-main-title">Management & Operations</h2>
          <span className="section-subtitle">Direct shortcuts</span>
        </div>

        <Row className="g-3">
          <Col xs={12} md={4}>
            <Link to="/submitted-form" className="hub-card">
              <div className="hub-header">
                <div className="hub-icon-box">
                  <DocumentCheckIcon className="hub-icon" />
                </div>
                <h3 className="hub-title">Submitted Applications</h3>
              </div>
              <p className="hub-description">
                Filter submissions by timeframes (7, 14, 30 days), search by member account, and export CSV spreadsheets.
              </p>
              <div className="hub-footer">
                <span>Manage Applications</span>
                <ArrowRightIcon className="hub-arrow-icon" />
              </div>
            </Link>
          </Col>

          <Col xs={12} md={4}>
            <Link to="/total-accounts" className="hub-card">
              <div className="hub-header">
                <div className="hub-icon-box">
                  <CircleStackIcon className="hub-icon" />
                </div>
                <h3 className="hub-title">Member Accounts Directory</h3>
              </div>
              <p className="hub-description">
                Browse eligible member loans, verify account numbers and SSN details, or perform roster maintenance.
              </p>
              <div className="hub-footer">
                <span>Browse Directory</span>
                <ArrowRightIcon className="hub-arrow-icon" />
              </div>
            </Link>
          </Col>

          <Col xs={12} md={4}>
            <Link to="/settings" className="hub-card">
              <div className="hub-header">
                <div className="hub-icon-box">
                  <CloudArrowUpIcon className="hub-icon" />
                </div>
                <h3 className="hub-title">Loan Data Ingestion</h3>
              </div>
              <p className="hub-description">
                Upload new CSV or Excel loan spreadsheets to update eligible accounts for active Skip-A-Payment cycles.
              </p>
              <div className="hub-footer">
                <span>Upload Data</span>
                <ArrowRightIcon className="hub-arrow-icon" />
              </div>
            </Link>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Dashboard;
