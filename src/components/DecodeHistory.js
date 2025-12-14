// src/components/DecodeHistory.js
import React, { useEffect, useState } from "react";
import { FaEye, FaEyeSlash, FaTrash, FaDownload } from "react-icons/fa";
import "../styles/EncodeHistory.css"; // reuse same styling

const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";

export default function DecodeHistory() {
  const token = localStorage.getItem("token");

  const [items, setItems] = useState([]);
  const [open, setOpen] = useState({});
  const [details, setDetails] = useState({});

  // ---------------- LOAD DECODE HISTORY ----------------
  useEffect(() => {
    fetch(`${API_BASE}/api/history/decode/list`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setItems(d.items || []));
  }, [token]);

  // ---------------- TOGGLE VIEW (WITH PASSWORD) ----------------
  const toggle = async (id) => {
    // OPEN
    if (!open[id]) {
      const password = window.prompt(
        "Enter the password used during decoding:"
      );
      if (!password) return;

      const res = await fetch(
        `${API_BASE}/api/history/decode/${id}/view?password=${encodeURIComponent(
          password
        )}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        alert("Incorrect password");
        return;
      }

      const data = await res.json();
      setDetails((prev) => ({ ...prev, [id]: data }));
    }

    // TOGGLE UI
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // ---------------- DELETE ----------------
  const remove = async (id) => {
    if (!window.confirm("Delete this record?")) return;

    await fetch(`${API_BASE}/api/history/decode/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  // ---------------- DOWNLOAD ----------------
  const downloadImage = (fileId, name) => {
    const link = document.createElement("a");
    link.href = `${API_BASE}/api/history/image/${fileId}?token=${token}&download=1`;
    link.download = `${name}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ---------------- UI ----------------
  return (
    <div className="table">
      <div className="thead">
        <span>Encoded Image</span>
        <span>Password</span>
        <span>Decoded Message</span>
        <span>Status</span>
        <span>Created</span>
        <span>Actions</span>
      </div>

      {items.map((i) => {
        const show = open[i.id];
        const d = details[i.id] || {};

        return (
          <div className="trow" key={i.id}>
            {/* ENCODED IMAGE */}
            <div className="img-cell">
              <img
                src={`${API_BASE}/api/history/image/${i.encoded_image_file_id}?token=${token}`}
                className={show ? "unblur" : "blur"}
                alt="encoded"
              />
              {show && (
                <FaDownload
                  className="download"
                  onClick={() =>
                    downloadImage(i.encoded_image_file_id, `decoded_${i.id}`)
                  }
                />
              )}
            </div>

            {/* PASSWORD */}
            <span>{show ? d.password : "********"}</span>

            {/* MESSAGE */}
            <span>{show ? d.message : "********"}</span>

            {/* STATUS */}
            <span>{i.status}</span>

            {/* CREATED */}
            <span className="created">
              {new Date(i.created_at).toLocaleDateString()}
              <br />
              {new Date(i.created_at).toLocaleTimeString()}
            </span>

            {/* ACTIONS */}
            <div className="actions">
              {show ? (
                <FaEyeSlash
                  className="eye active"
                  onClick={() => toggle(i.id)}
                />
              ) : (
                <FaEye className="eye" onClick={() => toggle(i.id)} />
              )}

              {show && (
                <FaTrash
                  className="trash"
                  onClick={() => remove(i.id)}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
