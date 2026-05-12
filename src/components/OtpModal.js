/* src/components/OtpModal.js */
import React, { useState, useEffect } from 'react';
import { FaShieldAlt } from 'react-icons/fa';
import '../styles/OtpModal.css';

export default function OtpModal({ isOpen, onClose, onVerify, onResend, email }) {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        if (isOpen) {
            setOtp(['', '', '', '', '', '']);
            setError('');
            setSuccessMsg('');
            // Focus first input
            setTimeout(() => {
                const firstInput = document.getElementById('otp-0');
                if (firstInput) firstInput.focus();
            }, 100);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleResend = async () => {
        if (!onResend) return;
        setResending(true);
        setError('');
        setSuccessMsg('');
        try {
            await onResend();
            setSuccessMsg('A new OTP has been sent to your email.');
        } catch (err) {
            setError(err.message || 'Failed to resend OTP.');
        } finally {
            setResending(false);
        }
    };
    
    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        // Focus next input
        if (element.nextSibling && element.value !== '') {
            element.nextSibling.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace') {
            if (otp[index] === '' && e.target.previousSibling) {
                e.target.previousSibling.focus();
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length < 6) {
            setError('Please enter the full 6-digit code.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccessMsg('');
        try {
            await onVerify(code);
        } catch (err) {
            setError(err.message || 'Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="otp-modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="otp-icon-wrapper">
                        <FaShieldAlt />
                    </div>
                    <h2>OTP Verification</h2>
                    <p>We've sent a 6-digit code to your email <span className="highlight-email">{email}</span></p>
                </div>

                <form className="otp-form" onSubmit={handleSubmit}>
                    <div className="otp-inputs">
                        {otp.map((data, index) => (
                            <input
                                key={index}
                                id={`otp-${index}`}
                                type="text"
                                maxLength="1"
                                value={data}
                                onChange={(e) => handleChange(e.target, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                onFocus={(e) => e.target.select()}
                                autoComplete="off"
                            />
                        ))}
                    </div>

                    {error && <div className="otp-error-msg">{error}</div>}
                    {successMsg && <div className="otp-success-msg" style={{ color: '#00e5ff', background: 'rgba(0, 229, 255, 0.1)', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', textAlign: 'center', marginBottom: '1.5rem', border: '1px solid rgba(0, 229, 255, 0.2)' }}>{successMsg}</div>}

                    <div className="otp-actions">
                        <button type="button" className="modal-btn cancel" onClick={onClose} disabled={loading || resending}>
                            Cancel
                        </button>
                        <button type="submit" className="modal-btn verify" disabled={loading || resending}>
                            {loading ? 'Verifying...' : 'Verify & Reveal'}
                        </button>
                    </div>
                </form>

                <div className="otp-footer">
                    <p>
                        Didn't receive the code? Check your spam folder or 
                        <span 
                            className={`resend-link ${resending ? 'disabled' : ''}`} 
                            onClick={resending ? null : handleResend}
                            style={{ marginLeft: '5px' }}
                        >
                            {resending ? 'Sending...' : 'click here to resend'}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}
