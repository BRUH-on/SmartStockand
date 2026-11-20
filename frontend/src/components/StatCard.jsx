import React from 'react';

export default function StatCard({
  title,
  value,
  icon,
  theme = 'espresso',
  subtitle,
  trend,
  trendType = 'up'
}) {
  return (
    <div className={`stat-card stat-${theme} animate-slide-up`}>
      <div className="flex items-center justify-between mb-2">
        <span className="stat-label">{title}</span>
        <div className={`stat-icon icon-${theme}`}>
          {typeof icon === 'string' ? <i className={icon}></i> : icon}
        </div>
      </div>
      <div className="stat-value">{value}</div>
      {(subtitle || trend) && (
        <div className="flex items-center justify-between mt-2">
          {subtitle && <span className="text-sm text-muted">{subtitle}</span>}
          {trend && (
            <span className={`stat-trend ${trendType}`}>
              <i className={`bi bi-arrow-${trendType === 'up' ? 'up-short' : 'down-short'}`}></i>
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
