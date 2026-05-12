/* src/components/DeleteModal.js */
import React from 'react';
import { FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import '../styles/DeleteModal.css';

export default function DeleteModal({ isOpen, onClose, onConfirm, title = "Confirm Deletion", message = "Are you sure you want to delete this record? This action cannot be undone." }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="delete-modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-glitch-border"></div>
                
                <div className="modal-header">
                    <div className="warning-icon-wrapper">
                        <FaExclamationTriangle />
                    </div>
                    <h2>{title}</h2>
                </div>

                <div className="modal-body">
                    <p>{message}</p>
                </div>

                <div className="modal-actions">
                    <button className="modal-btn cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="modal-btn delete-confirm" onClick={onConfirm}>
                        <FaTrash />
                        <span>Delete Record</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
