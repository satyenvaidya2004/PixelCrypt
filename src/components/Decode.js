// src/components/Decode.js
import React, { useRef, useState, useContext } from "react";
import axios from "../utils/api";
import "../styles/Decode.css";
import LoadingOverlay from "./LoadingOverlay";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import AuthContext from "./AuthContext";
import { useNavigate } from "react-router-dom";

function Decode() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState(null);
  const [password, setPassword] = useState("");
  const [decodedMessage, setDecodedMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const fileInputRef = useRef(null);

  // ---------------- FILE HANDLING ----------------
  const handleFileChange = (e) => {
    const img = e.target.files?.[0];
    if (!img) return;

    const ext = img.name.split(".").pop()?.toLowerCase() || "";
    if (!["jpg", "jpeg", "png"].includes(ext)) {
      setError("Only PNG/JPG encoded stego images can be decoded.");
      setFile(null);
      setPreview(null);
      setFileName("");
      setDecodedMessage("");
      return;
    }

    setFile(img);
    setFileName(img.name);
    setPreview(URL.createObjectURL(img));
    setError("");
    setDecodedMessage("");
  };

  // ---------------- DECODE ----------------
  const handleDecode = async () => {
    if (!user) {
      navigate("/login", { state: { next: "/decode" } });
      return;
    }

    if (!file) {
      setError("Please upload a stego image first.");
      return;
    }

    setLoading(true);
    setError("");
    setDecodedMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("password", password);

      const response = await axios.post(
        "/api/stego/decode",
        formData
      );

      if (response.data?.message) {
        setDecodedMessage(response.data.message);
      } else {
        setError("Unexpected server response.");
      }
    } catch (err) {
      const detail =
        err?.response?.data?.detail ||
        err?.message ||
        "Unknown error";
      setError(`Decode failed: ${detail}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoadingOverlay show={loading} message="Decoding..." />

      <div className="decode-container">
        <h2>Decode Stego Image</h2>

        <div className="decode-form">
          <label>Upload Stego Image (JPG/JPEG)</label>

          <div className="upload-box">
            <label className="upload-btn">
              Choose Image
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </label>
            <span className="file-name">
              {fileName || "No file chosen"}
            </span>
          </div>

          {preview && (
            <div className="upload-preview">
              <img src={preview} alt="Stego Preview" />
            </div>
          )}

          <label>Password</label>
          <div className="input-wrapper">
            <input
              className="styled-input"
              type={showPassword ? "text" : "password"}
              placeholder="Enter decode password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="toggle-eye"
              title={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((s) => !s)}
            >
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </span>
          </div>

          <button onClick={handleDecode} disabled={loading}>
            {loading ? "Decoding..." : "Decode"}
          </button>
        </div>

        {error && <div className="error-box">{error}</div>}

        {decodedMessage && (
          <div className="decoded-result">
            <h3>Decoded Message:</h3>
            <p>{decodedMessage}</p>
          </div>
        )}
      </div>
    </>
  );
}

export default Decode;
