import React from 'react';
import PropTypes from 'prop-types';
import { CheckCircle2 } from 'lucide-react';
import './AlertSystem.css';

const AlertSystem = React.memo(({ alerts }) => {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="empty-alerts" role="status" aria-live="polite">
        <CheckCircle2 size={32} className="text-status-low" aria-hidden="true" />
        <p>No active alerts</p>
      </div>
    );
  }

  return (
    <section className="alert-list" aria-label="Active Alerts" role="log" aria-live="polite">
      {alerts.map(alert => {
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
      icon: PropTypes.elementType
    })
  ).isRequired
};

AlertSystem.displayName = 'AlertSystem';

export default AlertSystem;
