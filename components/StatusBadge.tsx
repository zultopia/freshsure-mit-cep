interface StatusBadgeProps {
  status: 'Good' | 'Warning' | 'Critical';
  className?: string;
}

const StatusBadge = ({ status, className = '' }: StatusBadgeProps) => {
  const styles = {
    Good: 'bg-green-100 text-green-800 border-green-300',
    Warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    Critical: 'bg-red-100 text-red-800 border-red-300',
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status]} ${className}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;

