import { useState, useEffect } from 'react'
import { useTranslation } from './hooks/useTranslation'
import { FILE_CONFIG, LANGUAGES, getFileValidationError } from './config/constants'
import './App.css'

function App() {
  // Get translation state and functions from our custom hook
  const { job, error, uploading, uploadFile, startTranslation, downloadFile, clearError } = useTranslation()

  // Local state for file input and language selection
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [targetLanguage, setTargetLanguage] = useState('es') // Default to Spanish
  const [shouldAutoTranslate, setShouldAutoTranslate] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)

  // FAQ accordion state - track which FAQ item is open (null means all closed)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

  // Toggle FAQ item
  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index)
  }

  // Handle file selection from input
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file before setting
      const validationError = getFileValidationError(file)
      if (validationError) {
        setFileError(validationError)
        event.target.value = '' // Clear the input
        return
      }
      // Clear any previous errors and set the file
      setFileError(null)
      setSelectedFile(file)
    }
  }

  // Auto-dismiss file errors after 5 seconds
  useEffect(() => {
    if (fileError) {
      const timer = setTimeout(() => setFileError(null), 5000)
      return () => clearTimeout(timer)  // Cleanup on unmount or re-run
    }
  }, [fileError])

  // Auto-dismiss API errors after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000)
      return () => clearTimeout(timer)
    }
  }, [error, clearError])

  // Handle upload and translate button click
  const handleUploadAndTranslate = async () => {
    if (selectedFile) {
      setShouldAutoTranslate(true) // Flag to auto-start translation after upload
      await uploadFile(selectedFile)
      // Keep selectedFile to maintain the split layout during upload/translation
    }
  }

  // Auto-start translation after upload completes
  useEffect(() => {
    if (shouldAutoTranslate && job && job.status === 'pending') {
      setShouldAutoTranslate(false) // Reset flag
      startTranslation(job.job_id, targetLanguage)
    }
  }, [job, shouldAutoTranslate, targetLanguage, startTranslation])

  // Handle download button click
  const handleDownload = async () => {
    if (job) {
      await downloadFile(job.job_id)
    }
  }

  // Handle smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Handle logo click - refresh to initial state
  const handleLogoClick = () => {
    window.location.reload()
  }

  // Handle back button - reset to initial state
  const handleBack = () => {
    window.location.reload()
  }

  return (
    <div className="app">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-content">
          <h1 className="navbar-logo" onClick={handleLogoClick}>Translato</h1>
          <div className="navbar-links">
            <button onClick={() => scrollToSection('how-it-works')} className="nav-link">
              How it works
            </button>
            <button onClick={() => scrollToSection('faq')} className="nav-link">
              FAQ
            </button>
          </div>
        </div>
      </nav>

      {/* Error Display - API errors */}
      {error && (
        <div className="error">
          <p>Error: {error}</p>
        </div>
      )}

      {/* Hero Section with Upload */}
      <section id="hero" className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Translate your documents with ease.</h1>
          <p className="hero-subtitle">
            Drag & drop Word or PowerPoint files. We translate the text but keep the formatting, and layout perfectly intact.
          </p>

          {/* File Validation Error */}
          {fileError && (
            <div className="file-error">
              <span className="error-icon">⚠️</span>
              <p>{fileError}</p>
            </div>
          )}

          <div className="upload-section">
            <div className={`upload-container ${selectedFile || job ? 'has-file' : 'empty'}`}>
              {!selectedFile && !job ? (
                /* Empty State - No file selected */
                <>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept={FILE_CONFIG.ACCEPTED_FILE_TYPES.join(',')}
                  />
                  <div className="upload-empty-state">
                    <div className="upload-icon">📄</div>
                    <p className="upload-text">Drop file here or click to browse</p>
                    <p style={{ fontSize: '0.875rem', opacity: 0.4, margin: 0 }}>
                      Supports {FILE_CONFIG.ACCEPTED_FILE_TYPES_DISPLAY}
                    </p>
                  </div>
                </>
              ) : job?.status === 'completed' ? (
                /* Completed State - Clean success message with action buttons */
                <div className="completed-state">
                  <h2 className="completed-title">Translation Complete!</h2>
                  <p className="completed-filename">{job.filename}</p>
                  <div className="completed-actions">
                    <button onClick={handleBack} className="back-button" aria-label="Go back">
                      ←
                    </button>
                    <button onClick={handleDownload} className="download-button">
                      Download Translated File
                    </button>
                  </div>
                </div>
              ) : (
                /* File Selected or Job In Progress */
                <>
                  {/* Left: File Preview */}
                  <div className="file-preview">
                    {!uploading && !job && (
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept={FILE_CONFIG.ACCEPTED_FILE_TYPES.join(',')}
                        className="file-preview-input"
                      />
                    )}
                    <div className="file-preview-icon">
                      {(selectedFile?.name.endsWith('.docx') || job?.filename.endsWith('.docx')) ? '📝' : '📊'}
                    </div>
                    <div className="file-preview-name">
                      {selectedFile?.name || job?.filename}
                    </div>
                    <div className="file-preview-meta">
                      {selectedFile && `${(selectedFile.size / 1024).toFixed(1)} KB • ${selectedFile.name.endsWith('.docx') ? 'Word Document' : 'PowerPoint'}`}
                      {job && `Status: ${job.status}`}
                    </div>
                    {!uploading && !job && <p className="file-preview-change">Click to change file</p>}
                  </div>

                  {/* Right: Translation Settings or Status */}
                  <div className="translation-settings">
                    <div>
                      <h3>{job ? 'Translating...' : 'Translation Settings'}</h3>
                      <label>
                        Target Language
                        <select
                          value={targetLanguage}
                          onChange={(e) => setTargetLanguage(e.target.value)}
                          disabled={uploading || !!job}
                        >
                          {LANGUAGES.map((lang) => (
                            <option key={lang.code} value={lang.code}>
                              {lang.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <button
                      onClick={handleUploadAndTranslate}
                      disabled={uploading || !!job}
                      className={(uploading || job) ? 'loading' : ''}
                    >
                      {(uploading || job) && <span className="spinner"></span>}
                      {uploading ? 'Uploading...' : job ? 'Translating...' : 'Upload & Translate'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>


      {/* How it Works Section */}
      <section id="how-it-works" className="info-section">
        <div className="info-content">
          <h2 className="info-title">How it works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Upload your document</h3>
              <p>Drag and drop or click to select your Word (.docx) or PowerPoint (.pptx) file</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Choose target language</h3>
              <p>Select from Spanish, French, German, Dutch, or Italian</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>We translate</h3>
              <p>Our AI translates your text while preserving all formatting and layout</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Download result</h3>
              <p>Get your translated document with perfect formatting intact</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="info-section faq-section">
        <div className="info-content">
          <h2 className="info-title">Frequently Asked Questions</h2>
          <div className="faq-list">
            <div className={`faq-item ${openFaqIndex === 0 ? 'open' : ''}`}>
              <button className="faq-question" onClick={() => toggleFaq(0)}>
                <h3>What file formats are supported?</h3>
                <span className="faq-icon">{openFaqIndex === 0 ? '−' : '+'}</span>
              </button>
              {openFaqIndex === 0 && (
                <div className="faq-answer">
                  <p>We currently support Microsoft Word (.docx) and PowerPoint (.pptx) files.</p>
                </div>
              )}
            </div>

            <div className={`faq-item ${openFaqIndex === 1 ? 'open' : ''}`}>
              <button className="faq-question" onClick={() => toggleFaq(1)}>
                <h3>Will my formatting be preserved?</h3>
                <span className="faq-icon">{openFaqIndex === 1 ? '−' : '+'}</span>
              </button>
              {openFaqIndex === 1 && (
                <div className="faq-answer">
                  <p>Yes! We translate only the text content while keeping all formatting, fonts, colors, and layout exactly as they were.</p>
                </div>
              )}
            </div>

            <div className={`faq-item ${openFaqIndex === 2 ? 'open' : ''}`}>
              <button className="faq-question" onClick={() => toggleFaq(2)}>
                <h3>What languages can I translate to?</h3>
                <span className="faq-icon">{openFaqIndex === 2 ? '−' : '+'}</span>
              </button>
              {openFaqIndex === 2 && (
                <div className="faq-answer">
                  <p>Currently we support translation to Spanish, French, German, Dutch, and Italian.</p>
                </div>
              )}
            </div>

            <div className={`faq-item ${openFaqIndex === 3 ? 'open' : ''}`}>
              <button className="faq-question" onClick={() => toggleFaq(3)}>
                <h3>How long does translation take?</h3>
                <span className="faq-icon">{openFaqIndex === 3 ? '−' : '+'}</span>
              </button>
              {openFaqIndex === 3 && (
                <div className="faq-answer">
                  <p>Most documents are translated within 30-60 seconds, depending on the size and complexity.</p>
                </div>
              )}
            </div>

            <div className={`faq-item ${openFaqIndex === 4 ? 'open' : ''}`}>
              <button className="faq-question" onClick={() => toggleFaq(4)}>
                <h3>Is my data secure?</h3>
                <span className="faq-icon">{openFaqIndex === 4 ? '−' : '+'}</span>
              </button>
              {openFaqIndex === 4 && (
                <div className="faq-answer">
                  <p>Yes, your documents are processed securely and deleted from our servers after translation.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default App
