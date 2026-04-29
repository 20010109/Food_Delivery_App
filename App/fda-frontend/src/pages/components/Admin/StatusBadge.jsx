function StatusBadge({ status }) {
    const colors = {
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-700",
      denied: "bg-red-100 text-red-700",
    };
  
    return (
      <span className={`px-2 py-1 text-xs rounded ${colors[status]}`}>
        {status}
      </span>
    );
  }
  
  export default StatusBadge;