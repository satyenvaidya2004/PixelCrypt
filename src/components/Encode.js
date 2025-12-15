// src/components/Encode.js
import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/api";
import "../styles/Encode.css";
import LoadingOverlay from "./LoadingOverlay";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const ALLOWED_EXTENSIONS = ["jpg", "jpeg"];
const LAST_CHAR_MASK_MS = 2500; // milliseconds before last visible char gets masked

function Encode() {
  const navigate = useNavigate();

  // ---------------- AUTH CHECK ----------------
  const isLoggedIn = () => {
    return !!localStorage.getItem("token");
  };

  // ---------------- FILE / UI STATES ----------------
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [encodedImage, setEncodedImage] = useState(null);
  const [downloadName, setDownloadName] = useState("encoded_image.jpg");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ---------------- MESSAGE & PASSWORD ----------------
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");

  // ---------------- MASKING STATES ----------------
  const [showMessage, setShowMessage] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [revealedIndex, setRevealedIndex] = useState(-1);
  const revealTimer = useRef(null);

  // textarea ref
  const taRef = useRef(null);

  // ---------------- FILE HANDLING ----------------
  const handleFileChange = (e) => {
    const img = e.target.files?.[0];
    if (!img) return;

    const ext = img.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setError("Only JPG/JPEG images are supported for DCT steganography.");
      setFile(null);
      setFileName("");
      setPreviewImage(null);
      setDownloadName("encoded_image.jpg");
      return;
    }

    setFile(img);
    setFileName(img.name);
    setPreviewImage(URL.createObjectURL(img));
    setDownloadName(`encoded_${img.name}`);
    setError("");
  };

  // ---------------- MASKING HELPERS ----------------
  const getDisplayValue = () => {
    if (showMessage) return message;
    if (!message) return "";

    const arr = [];
    for (let i = 0; i < message.length; i++) {
      arr.push(i === revealedIndex ? message[i] : "*");
    }
    return arr.join("");
  };

  const scheduleMasking = (index) => {
    if (revealTimer.current) clearTimeout(revealTimer.current);

    if (index < 0) {
      setRevealedIndex(-1);
      return;
    }

    setRevealedIndex(index);
    revealTimer.current = setTimeout(() => {
      setRevealedIndex(-1);
      revealTimer.current = null;
    }, LAST_CHAR_MASK_MS);
  };

  useEffect(() => {
    return () => {
      if (revealTimer.current) clearTimeout(revealTimer.current);
    };
  }, []);

  // ---------------- CARET HELPERS ----------------
  const setCaret = (pos) => {
    const ta = taRef.current;
    if (!ta) return;
    try {
      ta.setSelectionRange(pos, pos);
      ta.focus();
    } catch {}
  };

  const insertAt = (text, start, end) => {
    const before = message.slice(0, start);
    const after = message.slice(end);
    const newMsg = before + text + after;
    setMessage(newMsg);
    scheduleMasking(before.length + text.length - 1);
    setTimeout(() => setCaret(before.length + text.length), 0);
  };

  const removeAt = (isBackspace, start, end) => {
    if (start !== end) {
      setMessage(message.slice(0, start) + message.slice(end));
      setTimeout(() => setCaret(start), 0);
      return;
    }

    if (isBackspace && start > 0) {
      setMessage(message.slice(0, start - 1) + message.slice(start));
      setTimeout(() => setCaret(start - 1), 0);
    } else if (!isBackspace && start < message.length) {
      setMessage(message.slice(0, start) + message.slice(start + 1));
      setTimeout(() => setCaret(start), 0);
    }
  };

  const onKeyDown = (e) => {
    const ta = taRef.current;
    if (!ta) return;

    const start = ta.selectionStart;
    const end = ta.selectionEnd;

    if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key.length === 1) {
      e.preventDefault();
      insertAt(e.key, start, end);
    } else if (e.key === "Backspace") {
      e.preventDefault();
      removeAt(true, start, end);
    } else if (e.key === "Delete") {
      e.preventDefault();
      removeAt(false, start, end);
    } else if (e.key === "Enter") {
      e.preventDefault();
      insertAt("\n", start, end);
    }
  };

  const onPaste = (e) => {
    e.preventDefault();
    const ta = taRef.current;
    if (!ta) return;

    const pasteText =
      (e.clipboardData || window.clipboardData).getData("text") || "";

    insertAt(pasteText, ta.selectionStart, ta.selectionEnd);
  };

  const onChangeWhenShown = (e) => {
    setMessage(e.target.value);
    setRevealedIndex(-1);
  };

  // ---------------- ENCODE ----------------
  const handleEncode = async () => {
    // 🔐 LOGIN REDIRECT
    if (!isLoggedIn()) {
      setTimeout(() => navigate("/login"), 800);
      return;
    }

    if (!file || !message || !password) {
      setError("Please upload an image, enter a message, and provide a password.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("secret_text", message);
    formData.append("password", password);

    try {
      const response = await axios.post("/api/stego/encode", formData, {
        responseType: "blob",
      });
      setEncodedImage(URL.createObjectURL(response.data));
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err.message ||
          "Encoding failed!"
      );
      setEncodedImage(null);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UI ----------------
  return (
    <>
      <LoadingOverlay show={loading} message="Encoding..." />

      <div className="encode-container">
        <h2>Encode Message</h2>

        <div className="encode-form">
          <label>Upload Image (JPG/JPEG)</label>

          <div className="upload-box">
            <label className="upload-btn">
              Choose Image
              <input type="file" accept="image/jpeg" onChange={handleFileChange} />
            </label>
            <span className="file-name">{fileName || "No file chosen"}</span>
          </div>

          {previewImage && (
            <div className="upload-preview">
              <img src={previewImage} alt="Preview" />
            </div>
          )}

          <label>Secret Message</label>
          <div className="input-wrapper textarea-wrapper">
            <textarea
              ref={taRef}
              placeholder="Enter the message you want to hide..."
              value={showMessage ? message : getDisplayValue()}
              onChange={showMessage ? onChangeWhenShown : undefined}
              onKeyDown={showMessage ? undefined : onKeyDown}
              onPaste={showMessage ? undefined : onPaste}
              spellCheck={false}
            />
            <span
              className="toggle-eye"
              title={showMessage ? "Hide message" : "Show message"}
              onClick={() => {
                setShowMessage((s) => !s);
                setRevealedIndex(-1);
              }}
            >
              {showMessage ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </span>
          </div>

          <label>Encryption Password</label>
          <div className="input-wrapper">
            <input
              className="styled-input"
              type={showPassword ? "text" : "password"}
              placeholder="Enter encryption password"
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

          <button onClick={handleEncode} disabled={loading}>
            {loading ? "Encoding..." : "Encode"}
          </button>

          {error && <p className="error-inline">{error}</p>}
        </div>

        {encodedImage && (
          <div className="result-section">
            <h3>Stego Image (Encoded)</h3>
            <img src={encodedImage} className="stego-preview" alt="Encoded" />
            <br /><br />
            <a href={encodedImage} download={downloadName}>
              <button className="download-button">Download Image</button>
            </a>
          </div>
        )}
      </div>
    </>
  );
}

export default Encode;
