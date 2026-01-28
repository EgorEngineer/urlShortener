import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getLinkDetails, getQRCode } from '../services/api'
import './LinkDetails.css'

function LinkDetails() {
  const { code } = useParams()
  const [link, setLink] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchLinkDetails = async () => {
      try {
        const data = await getLinkDetails(code)
        setLink(data)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchLinkDetails()
  }, [code])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="link-details">
        <div className="container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Загрузка...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="link-details">
        <div className="container">
          <div className="error-card">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <path d="M32 8L8 56H56L32 8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M32 24V36M32 44V48" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <h2>Ссылка не найдена</h2>
            <p>{error}</p>
            <Link to="/" className="back-btn">
              Вернуться на главную
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="link-details">
      <div className="container">
        <Link to="/" className="back-link">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 16L6 10L12 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Назад
        </Link>

        <div className="details-card">
          <div className="details-header">
            <h1>Информация о ссылке</h1>
            <div className="stats-badge">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 12C11.1046 12 12 11.1046 12 10C12 8.89543 11.1046 8 10 8C8.89543 8 8 8.89543 8 10C8 11.1046 8.89543 12 10 12Z" fill="currentColor"/>
                <path d="M10 3V5M10 15V17M3 10H5M15 10H17M5.63604 5.63604L7.05025 7.05025M12.9497 12.9497L14.364 14.364M14.364 5.63604L12.9497 7.05025M7.05025 12.9497L5.63604 14.364" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Активна
            </div>
          </div>

          <div className="details-grid">
            <div className="detail-item">
              <label>Короткий код:</label>
              <div className="detail-value code-value">
                <code>{link.code}</code>
              </div>
            </div>

            <div className="detail-item">
              <label>Оригинальная ссылка:</label>
              <div className="detail-value">
                <a 
                  href={link.originalUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="original-link"
                >
                  {link.originalUrl}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M12 8.66667V12.6667C12 13.0203 11.8595 13.3594 11.6095 13.6095C11.3594 13.8595 11.0203 14 10.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V5.33333C2 4.97971 2.14048 4.64057 2.39052 4.39052C2.64057 4.14048 2.97971 4 3.33333 4H7.33333M10 2H14M14 2V6M14 2L6.66667 9.33333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </div>
            </div>

            <div className="detail-item">
              <label>Дата создания:</label>
              <div className="detail-value">
                {formatDate(link.createdAt)}
              </div>
            </div>

            <div className="detail-item">
              <label>Количество переходов:</label>
              <div className="detail-value clicks-value">
                <span className="clicks-number">{link.clicks}</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 3C6.13401 3 3 6.13401 3 10C3 13.866 6.13401 17 10 17C13.866 17 17 13.866 17 10C17 6.13401 13.866 3 10 3Z" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M10 7V10L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
            </div>

            {link.expiresAt && (
              <div className="detail-item">
                <label>Срок действия:</label>
                <div className="detail-value">
                  {formatDate(link.expiresAt)}
                </div>
              </div>
            )}

            {link.maxClicks && (
              <div className="detail-item">
                <label>Максимум переходов:</label>
                <div className="detail-value">
                  {link.maxClicks}
                </div>
              </div>
            )}
          </div>

          <div className="qr-section-details">
            <h3>QR-код для ссылки</h3>
            <div className="qr-display">
              <img 
                src={getQRCode(code)} 
                alt="QR Code" 
                className="qr-image"
              />
              <p className="qr-hint">Отсканируйте QR-код для быстрого доступа к ссылке</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LinkDetails

