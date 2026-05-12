import React, { useRef, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/api";
import "../styles/Decode.css";
import LoadingOverlay from "./LoadingOverlay";
import Footer from "./Footer";
import {
  AiOutlineCloudUpload,
  AiOutlineLock,
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineCheckCircle,
  AiOutlineUnlock,
  AiOutlineFileImage,
  AiOutlineMessage
} from "react-icons/ai";
import { FaTrashAlt, FaEdit } from "react-icons/fa";
import { FiCopy } from "react-icons/fi";
import { MdOutlineSecurity } from "react-icons/md";
import { RiDoubleQuotesL, RiDoubleQuotesR } from "react-icons/ri";
import AuthContext from "./AuthContext";

const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png"];

function Decode() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // ---------------- AUTH CHECK ----------------
  const isLoggedIn = () => !!localStorage.getItem("token");

  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [preview, setPreview] = useState(null);
  const [password, setPassword] = useState("");
  const [decodedMessage, setDecodedMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading...");
  const [showPassword, setShowPassword] = useState(false);
  const [s3Key, setS3Key] = useState("");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // Track S3 upload status

  // ---------------- FILE HANDLING ----------------
  const handleFileChange = (e) => {
    const img = e.target.files?.[0];
    if (img) processFile(img);
  };

  const processFile = (img) => {
    const ext = img.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setError("Please upload a valid stego image (JPG, JPEG, or PNG).");
      return;
    }

    setFile(img);
    setFileName(img.name);
    setFileSize((img.size / (1024 * 1024)).toFixed(2) + " MB");

    const localBlob = URL.createObjectURL(img);
    setPreview(localBlob);
    setError("");
    setDecodedMessage("");

    // Immediate S3 Upload for persistence
    const uploadImmediate = async () => {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", img);
        const res = await axios.post("/api/upload/image?prefix=decrypt", formData);
        setS3Key(res.data.s3_key);
        if (res.data.s3_url) setPreview(res.data.s3_url);
        setError("");
      } catch (err) {
        console.error("S3 upload failed:", err);
        setError("Background image processing failed. Please try re-uploading.");
      } finally {
        setIsUploading(false);
      }
    };
    uploadImmediate();
  };

  const removeFile = () => {
    setFile(null);
    setFileName("");
    setFileSize("");
    setPreview(null);
    setS3Key("");
    setDecodedMessage("");
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ---------------- DRAG & DROP ----------------
  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) processFile(droppedFile);
  };

  // ---------------- DECODE ----------------
  const handleDecode = async () => {
    if (!isLoggedIn()) {
      setTimeout(() => navigate("/login"), 800);
      return;
    }

    if (!file || !password) {
      setError("Please select an image and enter the password.");
      return;
    }

    if (isUploading || !s3Key) {
      setError("Please wait for the image to finish processing.");
      return;
    }

    setLoadingText("Decoding...");
    setLoading(true);
    setError("");
    setDecodedMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("password", password);
      formData.append("encoded_s3_key", s3Key);

      const response = await axios.post("/api/stego/decode", formData);

      if (response.data?.message) {
        setDecodedMessage(response.data.message);
      } else {
        setError("Decoding failed. The image might not contain a hidden message or the password was incorrect.");
      }
    } catch (err) {
      let errorMessage = "Invalid password or corrupted stego-image.";
      const detail = err?.response?.data?.detail;
      if (typeof detail === "string") {
        errorMessage = detail;
      } else if (Array.isArray(detail) && detail.length > 0) {
        errorMessage = detail[0].msg || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(decodedMessage);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <>
      <LoadingOverlay show={loading} message={loadingText} />

      <div className="decode-page-wrapper">
        <div className="decode-grid">

          {/* LEFT COLUMN: INPUTS */}
          <div className="decode-card main-inputs">
            <div className="card-header">
              <div className="header-icon">
                <AiOutlineUnlock />
              </div>
              <div>
                <h2>Decode Secret Message</h2>
                <p>Reveal the hidden secret message from an encoded image.</p>
              </div>
            </div>

            {/* STEP 1: UPLOAD */}
            <div className="step-section">
              <div className="step-title">
                <AiOutlineCloudUpload className="step-icon" />
                <span>1. Upload Encoded Image</span>
              </div>

              {!file ? (
                <div
                  className={`drop-zone ${isDragging ? "dragging" : ""}`}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <AiOutlineCloudUpload className="upload-cloud" />
                  <p>Drag & drop your encoded image here</p>
                  <span>or <span className="highlight">click to browse</span></span>
                  <div className="upload-info">Supports: JPG, PNG, JPEG | Max size: 10MB</div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    hidden
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                <div className="file-card fade-in">
                  <div className="file-info">
                    <div className="file-preview-mini">
                      <img src={preview} alt="mini preview" />
                    </div>
                    <div className="file-details">
                      <span className="name">{fileName}</span>
                      <span className="size">{fileSize}</span>
                    </div>
                  </div>
                  <div className="file-actions">
                    <button className="change-btn" onClick={() => fileInputRef.current?.click()}>
                      <FaEdit /> <span>Change Image</span>
                    </button>
                    <FaTrashAlt className="delete-icon" onClick={removeFile} />
                    <input
                      type="file"
                      ref={fileInputRef}
                      hidden
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* STEP 2: PASSWORD */}
            <div className="step-section">
              <div className="step-title">
                <AiOutlineLock className="step-icon" />
                <span>2. Password</span>
              </div>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter the password used during encoding"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="eye-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                </div>
              </div>
              <p className="hint">This password is required to extract the hidden message.</p>
            </div>

            <button
              className={`decode-btn ${(isUploading || !file || !password) ? "disabled" : ""}`}
              onClick={handleDecode}
              disabled={loading || isUploading || !file || !password}
            >
              <div className="btn-content">
                {isUploading ? (
                  <>
                    <div className="spinner-mini"></div>
                    <span>Processing Image...</span>
                  </>
                ) : (
                  <>
                    <AiOutlineUnlock />
                    <span>Decode Image</span>
                  </>
                )}
              </div>
            </button>

            {error && (
              <div className="error-msg fade-in">
                <MdOutlineSecurity /> {error}
              </div>
            )}

            <div className="security-notice">
              <AiOutlineLock />
              <span>Your data is secure. We never share your files or messages.</span>
            </div>
          </div>

          {/* RIGHT COLUMN: RESULTS */}
          <div className="decode-results">

            {/* ENCODED PREVIEW */}
            <div className="decode-card preview-card">
              <div className="card-header-small">
                <div className="header-left">
                  <AiOutlineFileImage className="h-icon" />
                  <span>Encoded Image Preview</span>
                </div>
              </div>
              {preview ? (
                <div className="active-preview-container">
                  <img src={preview} alt="Encoded Preview" className="fade-in preview-standalone" />
                </div>
              ) : (
                <div className="image-display-box">
                  <div className="placeholder">
                    <AiOutlineFileImage />
                    <span>Upload an image to see preview</span>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* DECODED MESSAGE (FULL WIDTH) */}
        {decodedMessage && (
          <div className="decode-card result-card fade-in full-width-result">
            <div className="card-header-small">
              <div className="header-left">
                <AiOutlineMessage className="h-icon" />
                <span>Decoded Secret Message</span>
              </div>
            </div>

            <div className="message-reveal-box">
              <RiDoubleQuotesL className="quote-icon left" />
              <p className="revealed-text">{decodedMessage}</p>
              <RiDoubleQuotesR className="quote-icon right" />
            </div>

            <div className="success-banner">
              <div className="success-info">
                <AiOutlineCheckCircle className="check-icon" />
                <div>
                  <strong>Message decoded successfully!</strong>
                  <p>Your secret message has been revealed.</p>
                </div>
              </div>
              <button className="copy-btn" onClick={copyToClipboard}>
                {copySuccess ? (
                  <><AiOutlineCheckCircle /> <span>Copied!</span></>
                ) : (
                  <><FiCopy /> <span>Copy Message</span></>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default Decode;
