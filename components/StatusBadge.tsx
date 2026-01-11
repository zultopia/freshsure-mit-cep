interface StatusBadgeProps {
  status: 'Good' | 'Warning' | 'Critical';
  className?: string;
}

const StatusBadge = ({ status, className = '' }: StatusBadgeProps) => {
  const backgroundColors = {
    Good: '#B1D158',
    Warning: '#EDD44E',
    Critical: '#FF8D8D',
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium border ${className}`}
      style={{
        backgroundColor: backgroundColors[status],
        color: '#000000',
        borderColor: backgroundColors[status],
      }}
    >
      {status}
    </span>
  );
};

export default StatusBadge;

