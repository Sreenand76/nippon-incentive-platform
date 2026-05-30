const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="animate-pulse">
    <div className="bg-gray-50 border-b border-gray-100 p-4 flex gap-4">
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-200 rounded flex-1" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, row) => (
      <div key={row} className="border-b border-gray-50 p-4 flex gap-4">
        {Array.from({ length: cols }).map((_, col) => (
          <div key={col} className="h-4 bg-gray-100 rounded flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export default TableSkeleton;
