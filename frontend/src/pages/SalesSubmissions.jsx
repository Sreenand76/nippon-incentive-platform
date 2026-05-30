import React, { useMemo, useState } from 'react';
import { History, Calendar, ChevronDown, ChevronRight, Car } from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatRupee } from '../utils/formatCurrency';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import TableSkeleton from '../components/TableSkeleton';

const SalesSubmissions = () => {
  const { submissions, isSalesReady, refreshing } = useData();
  const [periodFilter, setPeriodFilter] = useState('all');
  const [expandedIds, setExpandedIds] = useState(new Set());

  const formatPeriod = (month, year) =>
    `${new Date(0, month - 1).toLocaleString('default', { month: 'long' })} ${year}`;

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const periods = useMemo(() => {
    return [...new Set(submissions.map((sub) => `${sub.month}-${sub.year}`))]
      .sort((a, b) => {
        const [monthA, yearA] = a.split('-').map(Number);
        const [monthB, yearB] = b.split('-').map(Number);
        return new Date(yearB, monthB - 1) - new Date(yearA, monthA - 1);
      });
  }, [submissions]);

  const visibleSubmissions = useMemo(() => {
    return [...submissions]
      .filter((sub) => {
        if (periodFilter === 'all') return true;
        return `${sub.month}-${sub.year}` === periodFilter;
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [submissions, periodFilter]);

  return (
    <div className={refreshing ? 'opacity-90 transition-opacity' : ''}>
      <PageHeader
        eyebrow="Sales officer"
        title="Past submissions"
        description="Review your saved monthly incentive submissions and payout history."
        badge={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200 shadow-sm">
            <History className="w-3.5 h-3.5 text-blue-600" />
            {visibleSubmissions.length} records
          </span>
        }
      />

      <section className="card">
        <div className="card-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-800">Submission history</h2>
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="select-field w-full max-w-[500px] sm:max-w-[300px] text-sm"
          >
            <option value="all">All periods</option>
            {periods.map((period) => {
              const [month, year] = period.split('-').map(Number);
              return (
                <option key={period} value={period}>
                  {formatPeriod(month, year)}
                </option>
              );
            })}
          </select>
        </div>

        {!isSalesReady ? (
          <TableSkeleton rows={5} cols={4} />
        ) : submissions.length === 0 ? (
          <EmptyState
            icon={History}
            title="No submissions yet"
            description="Save a calculation from the dashboard to see it here."
          />
        ) : visibleSubmissions.length === 0 ? (
          <EmptyState
            icon={History}
            title="No submissions found"
            description="Try changing the period filter."
          />
        ) : (
          <>
            {/* ── Desktop table ── */}
            <div className="hidden sm:block table-wrap">
              <table className="data-table min-w-[560px]">
                <thead>
                  <tr>
                    <th className="w-8" />
                    <th>Submitted</th>
                    <th>Period</th>
                    <th className="text-center">Units</th>
                    <th className="text-right">Payout</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleSubmissions.map((sub) => {
                    const isExpanded = expandedIds.has(sub.id);
                    const hasItems = sub.items && sub.items.length > 0;
                    return (
                      <React.Fragment key={sub.id}>
                        <tr
                          className={`${isExpanded ? 'bg-blue-50/40' : 'hover:bg-slate-50/80'} ${hasItems ? 'cursor-pointer' : ''}`}
                          onClick={() => hasItems && toggleExpand(sub.id)}
                        >
                          {/* Expand toggle */}
                          <td className="w-8 pr-0">
                            {hasItems ? (
                              <button
                                type="button"
                                className="flex items-center justify-center w-6 h-6 rounded-md hover:bg-slate-200/70 text-slate-400 transition-colors"
                                aria-label={isExpanded ? 'Collapse' : 'Expand'}
                              >
                                {isExpanded
                                  ? <ChevronDown className="w-3.5 h-3.5" />
                                  : <ChevronRight className="w-3.5 h-3.5" />
                                }
                              </button>
                            ) : null}
                          </td>

                          <td className="text-slate-600 text-sm">
                            {new Date(sub.timestamp).toLocaleString(undefined, {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </td>

                          <td className="font-medium text-slate-900">
                            {formatPeriod(sub.month, sub.year)}
                          </td>

                          <td className="text-center font-semibold tabular-nums">
                            {sub.totalCars}
                          </td>

                          <td className="text-right font-bold text-emerald-600 tabular-nums">
                            {formatRupee(sub.totalIncentive)}
                          </td>
                        </tr>

                        {/* Expanded breakdown row */}
                        {isExpanded && hasItems && (
                          <tr>
                            <td colSpan={5} className="p-0">
                              <div className="bg-slate-50/80 border-t border-b border-slate-100 px-6 py-3">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                                  <Car className="w-3 h-3" />
                                  Model breakdown
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                  {sub.items.map((item, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2.5 ring-1 ring-slate-200/80"
                                    >
                                      <div className="min-w-0">
                                        <p className="text-sm font-medium text-slate-800 truncate">
                                          {item.carName}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                                          {item.quantity} × {formatRupee(item.incentivePerCar)}
                                        </p>
                                      </div>
                                      <span className="text-sm font-bold text-slate-900 shrink-0 tabular-nums">
                                        {formatRupee(item.lineIncentive)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Mobile cards ── */}
            <div className="sm:hidden card-body space-y-3 pt-4">
              {visibleSubmissions.map((sub) => {
                const isExpanded = expandedIds.has(sub.id);
                const hasItems = sub.items && sub.items.length > 0;
                return (
                  <div key={sub.id} className="mobile-data-card">
                    <div
                      className={`flex items-start justify-between gap-3 ${hasItems ? 'cursor-pointer' : ''}`}
                      onClick={() => hasItems && toggleExpand(sub.id)}
                    >
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatPeriod(sub.month, sub.year)}
                        </div>
                        <p className="text-xs text-slate-400">
                          {new Date(sub.timestamp).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <p className="text-lg font-bold text-emerald-600 tabular-nums">
                          {formatRupee(sub.totalIncentive)}
                        </p>
                        {hasItems && (
                          <div className="text-slate-400">
                            {isExpanded
                              ? <ChevronDown className="w-4 h-4" />
                              : <ChevronRight className="w-4 h-4" />
                            }
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-slate-600">
                      <span className="font-medium text-slate-800">{sub.totalCars}</span> units sold
                    </p>

                    {/* Mobile expanded breakdown */}
                    {isExpanded && hasItems && (
                      <div className="mt-2 pt-2 border-t border-slate-100 space-y-1.5">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1">
                          <Car className="w-3 h-3" />
                          Model breakdown
                        </p>
                        {sub.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-100"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-slate-800 truncate">{item.carName}</p>
                              <p className="text-[11px] text-slate-500 tabular-nums">
                                {item.quantity} × {formatRupee(item.incentivePerCar)}
                              </p>
                            </div>
                            <span className="text-sm font-bold text-slate-900 shrink-0 tabular-nums">
                              {formatRupee(item.lineIncentive)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default SalesSubmissions;
