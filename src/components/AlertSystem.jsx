import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { CheckCircle2, Send, AlertTriangle, Info } from 'lucide-react';
import { logEvent } from '../firebase';
import './AlertSystem.css';

const AlertSystem = React.memo(({ alerts, isAdmin, onPostAlert }) => {
  const [postTitle, setPostTitle] = useState('');
  const [postMessage, setPostMessage] = useState('');
  const [postType, setPostType] = useState('announcement');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Track each alert view once when it renders
  useEffect(() => {
    if (alerts && alerts.length > 0) {
      alerts.slice(0, 3).forEach((alert) => {
        logEvent('alert_viewed', { alert_type: alert.type, alert_title: alert.title });
      });
    }
  }, [alerts]);

  const handlePostAlert = async (e) => {
    e.preventDefault();
    if (!postTitle.trim() || !postMessage.trim()) return;
    setSubmitting(true);
    try {
      await onPostAlert(postTitle.trim(), postMessage.trim(), postType);
      setPostTitle('');
      setPostMessage('');
      setSuccessMsg('Alert posted!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="alert-system-wrapper">
      {/* Alert List */}
      {!alerts || alerts.length === 0 ? (
        <div className="empty-alerts" role="status" aria-live="polite">
          <CheckCircle2 size={32} className="text-status-low" aria-hidden="true" />
          <p>No active alerts</p>
        </div>
      ) : (
        <section className="alert-list" aria-label="Active Alerts" role="log" aria-live="polite">
          {alerts.map((alert) => {
            const Icon = alert.icon;
            return (
              <article key={alert.id} className={`alert-item ${alert.type}`} tabIndex={0}>
                <div className="alert-icon" aria-hidden="true">
                  {Icon && <Icon size={20} />}
                </div>
                <div className="alert-content">
                  <h3 className="alert-title">{alert.title}</h3>
                  <p className="alert-message">{alert.message}</p>
                  <time className="alert-time">{alert.time}</time>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {/* Admin: Post Alert Form */}
      {isAdmin && (
        <form
          className="post-alert-form"
          onSubmit={handlePostAlert}
          aria-label="Post a new alert (Admin)"
        >
          <div className="post-alert-header">
            <span className="admin-label">⚡ Admin: Post Alert</span>
          </div>

          <select
            id="alert-type-select"
            value={postType}
            onChange={(e) => setPostType(e.target.value)}
            className="post-alert-select"
            aria-label="Alert type"
          >
            <option value="announcement">
              📢 Announcement
            </option>
            <option value="emergency">
              🚨 Emergency
            </option>
          </select>

          <input
            id="alert-title-input"
            type="text"
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            placeholder="Alert title…"
            className="post-alert-input"
            maxLength={60}
            required
            aria-label="Alert title"
          />
          <textarea
            id="alert-message-input"
            value={postMessage}
            onChange={(e) => setPostMessage(e.target.value)}
            placeholder="Alert message…"
            className="post-alert-textarea"
            maxLength={200}
            rows={3}
            required
            aria-label="Alert message"
          />

          {successMsg && (
            <p className="post-alert-success" role="status" aria-live="polite">
              {successMsg}
            </p>
          )}

          <button
            type="submit"
            className="post-alert-btn"
            disabled={submitting || !postTitle.trim() || !postMessage.trim()}
            aria-label="Post alert"
          >
            <Send size={14} />
            {submitting ? 'Posting…' : 'Post Alert'}
          </button>
        </form>
      )}
    </div>
  );
});

AlertSystem.propTypes = {
  alerts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      type: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
      time: PropTypes.string.isRequired,
      icon: PropTypes.elementType,
    })
  ).isRequired,
  isAdmin: PropTypes.bool,
  onPostAlert: PropTypes.func,
};

AlertSystem.defaultProps = {
  isAdmin: false,
  onPostAlert: () => {},
};

AlertSystem.displayName = 'AlertSystem';

export default AlertSystem;
