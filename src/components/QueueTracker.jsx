import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import './QueueTracker.css';

const QueueTracker = React.memo(({ queues }) => {
  const getStatusColor = useCallback((time) => {
    if (time < 10) return 'var(--status-low)';
    if (time < 20) return 'var(--status-med)';
    return 'var(--status-high)';
  }, []);

  const renderQueueSection = (type, title) => {
    const sectionQueues = queues.filter(q => q.type === type);
    return (
      <section key={type} aria-labelledby={`queue-title-${type}`}>
        <h3 id={`queue-title-${type}`} className="queue-category">{title}</h3>
        <div className="queue-list" role="list">
          {sectionQueues.map(q => {
            const Icon = q.icon;
            const progressWidth = Math.min((q.waitTime / 30) * 100, 100);
            const color = getStatusColor(q.waitTime);
            return (
              <article key={q.id} className="queue-item" role="listitem" tabIndex={0} aria-label={`${q.name} wait time is ${q.waitTime} minutes`}>
                <div className="queue-header" aria-hidden="true">
                  <span className="queue-name">{Icon && <Icon size={16} />} {q.name}</span>
                  <span className="queue-time" style={{ color }}>{q.waitTime} min</span>
                </div>
                <div className="progress-bg" role="progressbar" aria-valuenow={q.waitTime} aria-valuemin="0" aria-valuemax="45" aria-label={`Wait time progress for ${q.name}`}>
                  <div 
                    className="progress-fill" 
                    style={{ width: `${progressWidth}%`, backgroundColor: color }}
                  ></div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    );
  };

  return (
    <div aria-live="polite">
      {renderQueueSection('gate', 'Entry Gates')}
      {renderQueueSection('food', 'Food & Drink')}
      {renderQueueSection('toilet', 'Restrooms')}
    </div>
  );
});

QueueTracker.propTypes = {
  queues: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      icon: PropTypes.elementType,
      waitTime: PropTypes.number.isRequired
    })
  ).isRequired
};

QueueTracker.displayName = 'QueueTracker';

export default QueueTracker;
