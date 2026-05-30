const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 text-center">
    {Icon && <Icon className="w-10 h-10 text-slate-300 mb-3" strokeWidth={1.5} />}
    <p className="text-sm font-medium text-slate-600">{title}</p>
    {description && <p className="text-sm text-slate-400 mt-1 max-w-sm">{description}</p>}
  </div>
);

export default EmptyState;
