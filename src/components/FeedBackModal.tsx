import React from 'react'
import './feedbackModal.css'
const FeedBackModal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
        <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

export default FeedBackModal