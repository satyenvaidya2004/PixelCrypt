// src/components/Encode.js
import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/api";
import "../styles/Encode.css";
import LoadingOverlay from "./LoadingOverlay";
import Footer from "./Footer";
import {
  AiOutlineCloudUpload,
  AiOutlineInfoCircle,
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineLock,
  AiOutlineMessage,
  AiOutlineCloudDownload
} from "react-icons/ai";
import { FaRegFileImage, FaTrashAlt, FaEdit } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { MdOutlineSecurity } from "react-icons/md";
import { BsArrowRightShort, BsArrowDownShort } from "react-icons/bs";

const ALLOWED_EXTENSIONS = ["jpg", "jpeg"];
const MAX_FILE_SIZE_MB = 10;
const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";

function Encode() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // ---------------- AUTH CHECK ----------------
  const isLoggedIn = () => !!localStorage.getItem("token");

  // ---------------- FILE / UI STATES ----------------
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [encodedImage, setEncodedImage] = useState(null);
  const [downloadName, setDownloadName] = useState("encoded_image.jpg");
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading...");
  const [error, setError] = useState("");
  const [s3Key, setS3Key] = useState("");
  const [encodedS3Key, setEncodedS3Key] = useState("");

  // ---------------- MESSAGE & PASSWORD ----------------
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ---------------- DRAG & DROP ----------------
  const [isDragging, setIsDragging] = useState(false);

  // ---------------- FILE HANDLING ----------------
  const validateAndSetFile = (img) => {
    if (!img) return;

    const ext = img.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setError("Only JPG/JPEG images are supported.");
      return;
    }

    if (img.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File size must be less than ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    setFile(img);
    setFileName(img.name);
    setFileSize((img.size / (1024 * 1024)).toFixed(2) + " MB");

    const localBlob = URL.createObjectURL(img);
    setPreviewImage(localBlob);
    setDownloadName(`encoded_${img.name}`);
    setError("");
    setEncodedImage(null);

    // Upload immediately to S3
    const uploadImmediate = async () => {
      try {
        const formData = new FormData();
        formData.append("file", img);
        const res = await axios.post("/api/upload/image?prefix=original", formData);
        setS3Key(res.data.s3_key);
        if (res.data.s3_url) setPreviewImage(res.data.s3_url);
      } catch (err) {
        console.error("S3 upload error:", err);
      }
    };
    uploadImmediate();
  };

  const handleFileChange = (e) => validateAndSetFile(e.target.files?.[0]);

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    validateAndSetFile(droppedFile);
  };

  const removeFile = () => {
    setFile(null);
    setFileName("");
    setPreviewImage(null);
    setEncodedImage(null);
    setS3Key("");
    setEncodedS3Key("");
  };

  const handleDownload = () => {
    if (!encodedS3Key) return;
    const token = localStorage.getItem("token");
    const downloadUrl = `${API_BASE}/api/stego/download?s3_key=${encodeURIComponent(encodedS3Key)}&filename=${encodeURIComponent(downloadName)}&token=${token}`;
    window.location.href = downloadUrl;
  };

  // ---------------- ENCODE ----------------
  const handleEncode = async () => {
    if (!isLoggedIn()) {
      setTimeout(() => navigate("/login"), 800);
      return;
    }

    if (!file || !message || !password) {
      setError("Please complete all steps first.");
      return;
    }

    setLoadingText("Encoding...");
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("secret_text", message);
    formData.append("password", password);
    formData.append("original_s3_key", s3Key);

    try {
      const response = await axios.post("/api/stego/encode", formData);
      if (response.data.s3_url) {
        setEncodedImage(response.data.s3_url);
        setEncodedS3Key(response.data.encoded_s3_key);
      }
    } catch (err) {
      let errorMessage = "Encoding failed!";
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

  return (
    <>
      <LoadingOverlay show={loading} message={loadingText} />

      <div className="encode-page-wrapper">
        <div className="encode-grid">

          {/* LEFT COLUMN: INPUTS */}
          <div className="encode-card main-inputs">
            <div className="card-header">
              <div className="header-icon"><AiOutlineLock /></div>
              <div>
                <h2>Encode Secret Message</h2>
                <p>Hide your secret message inside an image using steganography.</p>
              </div>
            </div>

            <div className="step-section">
              <div className="step-title">
                <AiOutlineCloudUpload className="step-icon" />
                <span>1. Upload Original Image</span>
              </div>

              {!file ? (
                <div
                  className={`drop-zone ${isDragging ? "dragging" : ""}`}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current.click()}
                >
                  <AiOutlineCloudUpload className="upload-cloud" />
                  <p>Drag & drop your image here</p>
                  <span>or <span className="highlight">click to browse</span></span>
                  <div className="upload-info">Supports: JPG, JPEG | Max size: 10MB</div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    hidden
                    accept="image/jpeg,image/jpg"
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                <div className="file-card">
                  <div className="file-info">
                    <div className="file-preview-mini">
                      <img src={previewImage} alt="mini" />
                    </div>
                    <div className="file-details">
                      <span className="name">{fileName}</span>
                      <span className="size">{fileSize}</span>
                    </div>
                  </div>
                  <div className="file-actions">
                    <button className="change-btn" onClick={() => fileInputRef.current.click()}>
                      <FaEdit /> <span>Change Image</span>
                    </button>
                    <FaTrashAlt className="delete-icon" onClick={removeFile} />
                    <input
                      type="file"
                      ref={fileInputRef}
                      hidden
                      accept="image/jpeg,image/jpg"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="step-section">
              <div className="step-title">
                <AiOutlineMessage className="step-icon" />
                <span>2. Secret Message</span>
              </div>
              <div className="message-container">
                <textarea
                  placeholder="Type your secret message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={5000}
                />
                <div className="char-count">{message.length} / 5000 characters</div>
              </div>
            </div>

            <div className="step-section">
              <div className="step-title">
                <AiOutlineLock className="step-icon" />
                <span>3. Password</span>
              </div>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="eye-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                </div>
              </div>
              <p className="hint">This password will be required to extract the message.</p>
            </div>

            <button
              className={`generate-btn ${(!file || !message || !password) ? "disabled" : ""}`}
              onClick={handleEncode}
              disabled={loading || !file || !message || !password}
            >
              <div className="btn-content">
                <HiSparkles />
                <span>Generate / Encode Image</span>
                <BsArrowRightShort className="arrow" />
              </div>
            </button>

            {error && <div className="error-msg"><AiOutlineInfoCircle /> {error}</div>}

            <div className="security-notice">
              <AiOutlineLock />
              <span>Your data is secure. We never share your files or messages.</span>
            </div>
          </div>

          {/* RIGHT COLUMN: PREVIEWS */}
          <div className="encode-previews">

            {/* ORIGINAL PREVIEW */}
            <div className="encode-card preview-card">
              <div className="card-header-small">
                <div className="header-left">
                  <AiOutlineEye className="h-icon" />
                  <span>Original Image Preview</span>
                </div>
              </div>
              {previewImage ? (
                <div className="active-preview-container">
                  <img src={previewImage} alt="original" className="fade-in preview-standalone" />
                </div>
              ) : (
                <div className="image-display-box">
                  <div className="placeholder">
                    <FaRegFileImage />
                    <span>Upload an image to see preview</span>
                  </div>
                </div>
              )}
            </div>

            <div className="preview-connector">
              <BsArrowDownShort className="connector-arrow" />
            </div>

            {/* ENCODED PREVIEW */}
            <div className="encode-card preview-card">
              <div className="card-header-small">
                <div className="header-left">
                  <MdOutlineSecurity className="h-icon" />
                  <span>Encoded Image Preview (After Generation)</span>
                </div>
              </div>
              {encodedImage ? (
                <div className="active-preview-container">
                  <div className="hover-download-wrapper">
                    <img src={encodedImage} alt="encoded" className="fade-in preview-standalone" />
                    <div className="download-overlay" onClick={handleDownload}>
                      <AiOutlineCloudDownload className="overlay-icon" />
                      <span>DOWNLOAD IMAGE</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="image-display-box">
                  <div className="placeholder">
                    <FaRegFileImage />
                    <span>Encoded image will appear here</span>
                  </div>
                </div>
              )}
            </div>

            {encodedImage && (
              <div className="success-info-box">
                <div className="info-icon"><AiOutlineInfoCircle /></div>
                <div className="info-text">
                  <strong>The encoded image looks the same as the original.</strong>
                  <p>Your secret message is now hidden inside the image.</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Encode;
