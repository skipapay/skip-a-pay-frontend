import React, { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { Button, Form, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import * as yup from "yup";
import { login, reset } from "features/auth/authSlice";
import {
  Cog6ToothIcon,
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import "./login.scss";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toastId = useRef(null);
  const [showPassword, setShowPassword] = useState(false);

  const { user, message, isLoading, isError, isSuccess } = useSelector(
    (state) => state.auth
  );

  const validationSchema = yup.object().shape({
    email: yup
      .string()
      .trim()
      .email("Please enter a valid email address")
      .required("Email address is required"),
    password: yup.string().required("Password is required"),
  });

  useEffect(() => {
    if (isError) {
      if (toastId.current) {
        toast.update(toastId.current, {
          render: message || "Invalid email or password",
          type: "error",
          isLoading: false,
          autoClose: 5000,
          closeButton: true,
          closeOnClick: true,
        });
      } else {
        toast.error(message || "Invalid email or password");
      }
    }
    if (isSuccess || user) {
      if (toastId.current && isSuccess) {
        toast.update(toastId.current, {
          render: "Login successful! Redirecting...",
          type: "success",
          isLoading: false,
          autoClose: 3000,
          closeButton: true,
          closeOnClick: true,
        });
      } else if (isSuccess) {
        toast.success("Login successful! Redirecting...");
      }
      navigate("/");
    }

    dispatch(reset());
  }, [user, navigate, isLoading, isSuccess, isError, dispatch, message]);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      keepSign: false,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      toastId.current = toast.loading("Verifying credentials...", {
        autoClose: false,
        closeOnClick: false,
      });
      dispatch(login({ email: values.email.trim(), password: values.password }));
    },
  });

  const { errors, touched, handleSubmit, handleChange, values } = formik;

  return (
    <div className="login-page-wrapper">
      <div className="login-card-box">
        {/* Top Accent Gradient Line */}
        <div className="login-top-accent" />

        {/* Card Header */}
        <div className="login-card-header">
          <div className="login-brand-logo-box">
            <Cog6ToothIcon className="brand-icon" />
          </div>
          <h1 className="login-title">Skip A Pay Admin Portal</h1>
          <p className="login-subtitle">
            Enter your administrative credentials to access your dashboard
          </p>
        </div>

        {/* Form Body */}
        <div className="login-form-body">
          <Form noValidate onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="form-group-login">
              <label htmlFor="login-email" className="login-label">
                Email Address <span className="req-mark">*</span>
              </label>
              <div className="login-input-wrapper">
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  placeholder="admin@example.com"
                  value={values.email}
                  onChange={handleChange}
                  className={`login-input ${touched.email && errors.email ? "is-invalid" : ""}`}
                  autoComplete="email"
                />
                <EnvelopeIcon className="input-icon-lead" />
              </div>
              {touched.email && errors.email && (
                <div className="invalid-feedback">{errors.email}</div>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group-login">
              <label htmlFor="login-password" className="login-label">
                Password <span className="req-mark">*</span>
              </label>
              <div className="login-input-wrapper">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={values.password}
                  onChange={handleChange}
                  className={`login-input ${touched.password && errors.password ? "is-invalid" : ""}`}
                  autoComplete="current-password"
                />
                <LockClosedIcon className="input-icon-lead" />
                <button
                  type="button"
                  className="btn-toggle-eye"
                  onClick={() => setShowPassword((prev) => !prev)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="eye-icon" />
                  ) : (
                    <EyeIcon className="eye-icon" />
                  )}
                </button>
              </div>
              {touched.password && errors.password && (
                <div className="invalid-feedback">{errors.password}</div>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="d-flex align-items-center justify-content-between my-3">
              <Form.Check
                type="checkbox"
                id="keep-signed-in"
                name="keepSign"
                label={<span style={{ fontSize: 13, color: "#475569", userSelect: "none" }}>Remember this device</span>}
                checked={values.keepSign}
                onChange={handleChange}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="btn-submit-login"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />
                  Authenticating...
                </>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRightIcon className="login-btn-icon" />
                </>
              )}
            </Button>
          </Form>
        </div>

        {/* Security Footer */}
        <div className="login-card-footer">
          <div className="security-note">
            <span> Authorized Personnel Only</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
