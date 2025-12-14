// src/components/Encode.js
import React, { useRef, useState, useEffect } from "react";
import axios from "../utils/api";
import "../styles/Encode.css";
import LoadingOverlay from "./LoadingOverlay";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const ALLOWED_EXTENSIONS = ["jpg", "jpeg"];
const LAST_CHAR_MASK_MS = 2500; // milliseconds before last visible char gets masked

function Encode() {
  // file / UI states
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [encodedImage, setEncodedImage] = useState(null);
  const [downloadName, setDownloadName] = useState("encoded_image.jpg");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // message & password state (real values)
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");

  // masking and visibility states
  const [showMessage, setShowMessage] = useState(false); // eye toggle for message
  const [showPassword, setShowPassword] = useState(false); // eye toggle for password
  const [revealedIndex, setRevealedIndex] = useState(-1); // index of the currently revealed char
  const revealTimer = useRef(null);

  // textarea ref to control caret/selection
  const taRef = useRef(null);

  // --- File handling ---
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

  // --- Masking helpers ---
  // compute what to show in textarea
  const getDisplayValue = () => {
    if (showMessage) return message;
    if (!message) return "";
    // if revealedIndex is -1 show all masked
    const arr = [];
    for (let i = 0; i < message.length; i++) {
      if (i === revealedIndex) arr.push(message[i]);
      else arr.push("*");
    }
    return arr.join("");
  };

  // schedule masking of last revealed char
  const scheduleMasking = (index) => {
    if (revealTimer.current) {
      clearTimeout(revealTimer.current);
      revealTimer.current = null;
    }
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
      if (revealTimer.current) {
        clearTimeout(revealTimer.current);
      }
    };
  }, []);

  // caret helpers: set caret to position in textarea after updating display
  const setCaret = (pos) => {
    const ta = taRef.current;
    if (!ta) return;
    try {
      ta.setSelectionRange(pos, pos);
      ta.focus();
    } catch (e) {
      // ignore
    }
  };

  // Insert text (text can be single char or multi-char)
  const insertAt = (insertText, selectionStart, selectionEnd) => {
    // selectionStart..selectionEnd replaced
    const before = message.slice(0, selectionStart);
    const after = message.slice(selectionEnd);
    const newMsg = before + insertText + after;
    const newIdx = before.length + insertText.length - 1; // index of last typed char
    setMessage(newMsg);
    scheduleMasking(newIdx);
    // update caret after DOM update
    setTimeout(() => setCaret(before.length + insertText.length), 0);
  };

  const removeAt = (isBackspace, selectionStart, selectionEnd) => {
    // if selection has range, remove that
    if (selectionStart !== selectionEnd) {
      const before = message.slice(0, selectionStart);
      const after = message.slice(selectionEnd);
      const newMsg = before + after;
      setMessage(newMsg);
      setRevealedIndex(-1);
      setTimeout(() => setCaret(selectionStart), 0);
      return;
    }

    if (isBackspace) {
      // remove char before caret
      if (selectionStart === 0) return;
      const before = message.slice(0, selectionStart - 1);
      const after = message.slice(selectionStart);
      const newMsg = before + after;
      setMessage(newMsg);
      setRevealedIndex(-1);
      setTimeout(() => setCaret(selectionStart - 1), 0);
    } else {
      // Delete key: remove char at caret
      if (selectionStart >= message.length) return;
      const before = message.slice(0, selectionStart);
      const after = message.slice(selectionStart + 1);
      const newMsg = before + after;
      setMessage(newMsg);
      setRevealedIndex(-1);
      setTimeout(() => setCaret(selectionStart), 0);
    }
  };

  // Keydown handler for masking-enabled editing
  const onKeyDown = (e) => {
    // If user has toggled showMessage (unmasked), allow normal editing - but we still manage state for consistency
    const ta = taRef.current;
    if (!ta) return;
    const selStart = ta.selectionStart;
    const selEnd = ta.selectionEnd;

    // Handle printable characters (single-char)
    if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key.length === 1) {
      e.preventDefault();
      insertAt(e.key, selStart, selEnd);
      return;
    }

    // Backspace
    if (e.key === "Backspace") {
      e.preventDefault();
      removeAt(true, selStart, selEnd);
      return;
    }

    // Delete
    if (e.key === "Delete") {
      e.preventDefault();
      removeAt(false, selStart, selEnd);
      return;
    }

    // Enter -> insert newline
    if (e.key === "Enter") {
      e.preventDefault();
      insertAt("\n", selStart, selEnd);
      return;
    }

    // Arrow keys, Home/End, Tab, etc -> allow native behavior
    // Nothing else to intercept
  };

  // Paste handler
  const onPaste = (e) => {
    e.preventDefault();
    const ta = taRef.current;
    if (!ta) return;
    const pasteText = (e.clipboardData || window.clipboardData).getData("text") || "";
    const selStart = ta.selectionStart;
    const selEnd = ta.selectionEnd;
    if (!pasteText) return;
    insertAt(pasteText, selStart, selEnd);
  };

  // If showMessage is ON, allow normal onChange to replace message fully (useful when user wants full edit)
  const onChangeWhenShown = (e) => {
    // This runs only when showMessage === true (we will wire it conditionally)
    setMessage(e.target.value);
    setRevealedIndex(-1);
  };

  // Encode call
  const handleEncode = async () => {
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
        responseType: "blob"
      });
      const stegoURL = URL.createObjectURL(response.data);
      setEncodedImage(stegoURL);
    } catch (err) {
      console.error(err);
      const detail = err?.response?.data?.detail || err.message || "Encoding failed!";
      setError(detail);
      setEncodedImage(null);
    } finally {
      setLoading(false);
    }
  };

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
            {/* When showMessage is true we bind normal onChange so full editing is available.
                When showMessage is false we intercept keydown/paste to update real message (so asterisks remain). */}
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
                // toggling - when going from hidden->show, reveal full text
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
            <br />
            <br />
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