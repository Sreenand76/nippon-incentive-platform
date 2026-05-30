const PageHeader = ({ eyebrow, title, description, badge, children }) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8">
    <div className="min-w-0">
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-1.5">
          {eyebrow}
        </p>
      )}
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
      {description && (
        <p className="mt-2 text-sm sm:text-base text-slate-500 leading-relaxed max-w-2xl">
          {description}
        </p>
      )}
    </div>
    <div className="flex flex-wrap items-center gap-2 shrink-0">
      {badge}
      {children}
    </div>
  </div>
);

export default PageHeader;
