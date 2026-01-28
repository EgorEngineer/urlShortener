import React, { useState } from 'react'
import { createShortLink } from '../services/api'
import './URLShortener.css'

function URLShortener() {
  const [originalUrl, setOriginalUrl] = useState('')
  const [shortLink, setShortLink] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setShortLink(null)
    setCopied(false)

    if (!originalUrl) {
      setError('Пожалуйста, введите URL')
      return
    }

    setLoading(true)

    try {
      const data = await createShortLink(originalUrl)
      setShortLink(data)
      setOriginalUrl('')
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortLink.shortUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Ошибка копирования:', err)
    }
  }

  const downloadQRCode = () => {
    const link = document.createElement('a')
    link.href = shortLink.qrCode
    link.download = `qr-${shortLink.code}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="url-shortener">
      <div className="container">
        <div className="hero">
          <h1 className="title">
            Сократите свою ссылку
            <span className="gradient-text"> бесплатно</span>
          </h1>
          <p className="subtitle">
            Превратите длинные URL в короткие и удобные ссылки за секунды
          </p>
        </div>

        <div className="shortener-card">
          <form onSubmit={handleSubmit} className="shortener-form">
            <div className="input-group">
              <input
                type="text"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                placeholder="Вставьте вашу длинную ссылку здесь"
                className="url-input"
                disabled={loading}
              />
              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner"></span>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M4 10H16M16 10L12 6M16 10L12 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Сократить
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="error-message">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
                {error}
              </div>
            )}
          </form>

          {shortLink && (
            <div className="result-card">
              <div className="result-header">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h3>Ссылка успешно создана!</h3>
              </div>

              <div className="result-content">
                <div className="link-info">
                  <label>Оригинальная ссылка:</label>
                  <p className="original-url">{shortLink.originalUrl}</p>
                </div>

                <div className="link-info">
                  <label>Короткая ссылка:</label>
                  <div className="short-url-box">
                    <a 
                      href={shortLink.shortUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="short-url"
                    >
                      {shortLink.shortUrl}
                    </a>
                    <button 
                      onClick={copyToClipboard}
                      className="copy-btn"
                      title="Копировать"
                    >
                      {copied ? (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M8 3C7.44772 3 7 3.44772 7 4V5H5C3.89543 5 3 5.89543 3 7V15C3 16.1046 3.89543 17 5 17H13C14.1046 17 15 16.1046 15 15V13H15C16.1046 13 17 12.1046 17 11V4C17 3.44772 16.5523 3 16 3H8Z" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="qr-section">
                  <label>QR-код:</label>
                  <div className="qr-container">
                    <img src={shortLink.qrCode} alt="QR Code" className="qr-code" />
                    <button onClick={downloadQRCode} className="download-btn">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M10 3V13M10 13L6 9M10 13L14 9M4 17H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Скачать QR-код
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="features">
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M28 16C28 22.6274 22.6274 28 16 28C9.37258 28 4 22.6274 4 16C4 9.37258 9.37258 4 16 4C22.6274 4 28 9.37258 28 16Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 10V16L20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h3>Мгновенно</h3>
            <p>Создавайте короткие ссылки за считанные секунды</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M16 4V12M16 20V28M4 16H12M20 16H28" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <rect x="10" y="10" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h3>QR-коды</h3>
            <p>Автоматическая генерация QR-кодов для каждой ссылки</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M16 4L20 12H28L22 18L24 28L16 22L8 28L10 18L4 12H12L16 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>Бесплатно</h3>
            <p>Полностью бесплатный сервис без ограничений</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default URLShortener

