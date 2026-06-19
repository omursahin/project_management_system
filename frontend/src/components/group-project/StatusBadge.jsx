import React from 'react';

const StatusBadge = ({ status }) => {
  let badgeStyle = {
    padding: '4px 8px',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    display: 'inline-block'
  };

  if (status === 'onaylandı') {
    badgeStyle.backgroundColor = '#10b981'; // Yeşil
  } else if (status === 'reddedildi') {
    badgeStyle.backgroundColor = '#ef4444'; // Kırmızı
  } else {
    badgeStyle.backgroundColor = '#f59e0b'; // Turuncu/Sarı (Bekliyor)
  }

  return <span style={badgeStyle}>{status?.toUpperCase() || 'BEKLİYOR'}</span>;
};

export default StatusBadge;