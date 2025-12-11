import type { DragEvent } from 'react'
import { useCallback, useRef, useState } from 'react'
import type { ProcessorStatus } from '../hooks/useFileProcessor'

type Props = {
  onFiles: (files: FileList | File[]) => void
  status: ProcessorStatus
  warnings: string[]
}

export const Uploader = ({ onFiles, status, warnings }: Props) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setDragging] = useState(false)

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return
      onFiles(fileList)
    },
    [onFiles],
  )

  const onDrop = (evt: DragEvent<HTMLDivElement>) => {
    evt.preventDefault()
    setDragging(false)
    handleFiles(evt.dataTransfer.files)
  }

  const statusLabel =
    status === 'ready'
      ? 'Loaded'
      : status === 'parsing'
        ? 'Processing...'
        : status === 'error'
          ? 'Error'
          : 'Pending'

  return (
    <div
      className={`upload-card ${isDragging ? 'dragging' : ''}`}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={(e) => {
        e.preventDefault()
        setDragging(false)
      }}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
      }}
      aria-label="Click to upload Instagram export zip"
    >
      <div className="upload-header">
        <span className="upload-title">Instagram Export</span>
        <span className={`status-badge status-${status}`}>{statusLabel}</span>
      </div>
      <div className="upload-body">
        {status === 'parsing' ? (
          <>
            <div className="spinner" aria-label="Loading"></div>
            <p className="loading-text">Analyzing your data...</p>
          </>
        ) : (
          <>
            <div className="upload-icon" aria-hidden="true">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <p className="upload-text">
              Click to upload <strong>.zip</strong>
            </p>
            <p className="upload-hint">or drag & drop your Instagram export here</p>
            <input
              ref={inputRef}
              type="file"
              accept=".zip"
              onChange={(e) => handleFiles(e.target.files)}
              aria-label="Upload Instagram export zip"
              style={{ display: 'none' }}
            />
          </>
        )}
      </div>
      {warnings.length > 0 && (
        <ul className="warnings" aria-label="Warnings">
          {warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      )}
      {status === 'ready' && (
        <div className="scroll-indicator">
          <span className="scroll-text">Scroll down for results</span>
          <svg className="scroll-arrow" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      )}
    </div>
  )
}
