import React from 'react'
import { useModalStore } from '../../store/modalStore'
import './Modal.css'

export default function Modal() {
  const { 
    isOpen, type, title, message, confirmText, cancelText, 
    inputValue, setInputValue, onConfirm, close 
  } = useModalStore()

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) close()
  }

  return (
    <div className="modal-backdrop fade-in" onClick={handleBackdropClick}>
      <div className="modal-container glass-high pop-in">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={close}>×</button>
        </div>
        
        <div className="modal-body">
          <p>{message}</p>
          {type === 'prompt' && (
            <input 
              type="text" 
              className="modal-input" 
              value={inputValue} 
              autoFocus
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onConfirm(inputValue)}
            />
          )}
        </div>

        <div className="modal-footer">
          {type !== 'alert' && (
            <button className="btn-secondary" onClick={close}>{cancelText}</button>
          )}
          <button 
            className="btn-primary" 
            onClick={() => onConfirm(inputValue)}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
