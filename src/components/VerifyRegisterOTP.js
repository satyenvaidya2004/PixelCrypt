import React, { useContext, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthContext from "./AuthContext";
import "../styles/VerifyRegisterOTP.css";

const OTP_LENGTH = 6;

export default function VerifyPassword() {
  const { verifyRegisterOTP: verifyPasswordOTP } = useContext(AuthContext);
  const { state } = useLocation(); // expects { email }
  const navigate = useNavigate();

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputsRef = useRef([]);

  // ---------------- OTP HANDLERS ----------------
  const handleOtpChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);

    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  // ---------------- SUBMIT ----------------
  const submit = async () => {
    const otpValue = otp.join("");

    if (otpValue.length !== OTP_LENGTH) {
      setError("Please enter the complete OTP");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await verifyPasswordOTP({
        email: state?.email,
        otp: otpValue,
      });

      alert("OTP verified successfully");
      navigate("/login");
    } catch (err) {
      setError(err?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="verify-register">
      <h2>Verify OTP</h2>

      <p className="subtitle">
        Enter the OTP sent to your registered email
      </p>

      <div className="otp-box-wrapper">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputsRef.current[index] = el)}
            className="otp-box"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          />
        ))}
      </div>

      {error && <p className="error-text">{error}</p>}

      <button
        className="reset-btn"
        onClick={submit}
        disabled={loading}
      >
        {loading ? "Verifying..." : "Verify OTP"}
      </button>
    </div>
  );
}
