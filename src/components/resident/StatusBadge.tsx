
import React from 'react';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status.toUpperCase()) {
    case 'RESOLVED':
      return <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full whitespace-nowrap">Resolved</span>;
    case 'IN_PROGRESS':
      return <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full whitespace-nowrap">In Progress</span>;
    default:
      return <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full whitespace-nowrap">Pending</span>;
  }
};

export default StatusBadge;
