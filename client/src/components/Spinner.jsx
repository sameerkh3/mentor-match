/**
 * Reusable loading spinner.
 * size: 'sm' (w-5 h-5), 'md' (w-7 h-7, default), 'lg' (w-10 h-10)
 */
export default function Spinner({ size = 'md', className = '' }) {
  const sizeClass = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-10 h-10' : 'w-7 h-7';
  return (
    <div
      className={`${sizeClass} border-4 border-indigo-600 border-t-transparent rounded-full animate-spin ${className}`}
    />
  );
}
