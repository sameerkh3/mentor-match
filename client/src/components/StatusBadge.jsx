/** Colored status pill for mentorship request statuses. */
export default function StatusBadge({ status }) {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    accepted: 'bg-green-100 text-green-800 border-green-200',
    declined: 'bg-red-100 text-red-800 border-red-200',
  };

  const labels = {
    pending: 'Pending',
    accepted: 'Accepted',
    declined: 'Declined',
  };

  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        styles[status] ?? 'bg-gray-100 text-gray-700 border-gray-200'
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}
