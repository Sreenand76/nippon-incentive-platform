import React, { useEffect, useMemo, useRef, useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import {
  Calculator,
  CalendarDays,
  Car,
  IndianRupee,
  Save,
  Info,
  Layers,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatCarLabel } from '../utils/formatCar';
import { formatRupee } from '../utils/formatCurrency';
import { calculateModelIncentives } from '../utils/incentiveCalc';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import TableSkeleton from '../components/TableSkeleton';

const SlabBadge = ({ slab }) => (
  <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200/80">
    {slab.minCars}–{slab.maxCars ?? '∞'} · {formatRupee(slab.amountPerCar)}/unit
  </span>
);

// Uncontrolled-style input that holds raw string locally so backspacing to 0
// doesn't snap back due to React seeing no diff in the controlled value.
const QtyInput = ({ carId, initialValue, onChange, className }) => {
  const [raw, setRaw] = useState(initialValue === 0 ? '' : String(initialValue));

  const handleChange = (e) => {
    const val = e.target.value;
    setRaw(val);
    const parsed = parseInt(val, 10);
    onChange(carId, isNaN(parsed) || parsed < 0 ? 0 : parsed);
  };

  return (
    <input
      type="number"
      min="0"
      value={raw}
      onChange={handleChange}
      className={className}
      placeholder="0"
    />
  );
};

const SalesDashboard = () => {
  const {
    salesCars,
    salesSlabs,
    isSalesReady,
    refreshing,
    salesDraft,
    setSalesDraft,
    resetSalesDraft,
    refreshSubmissions,
  } = useData();

  const { quantities, month, year, calculationResult } = salesDraft;
  const syncRequestRef = useRef(0);

  const localResult = useMemo(() => {
    if (!isSalesReady) return null;
    return calculateModelIncentives(salesCars, salesSlabs, quantities);
  }, [isSalesReady, salesCars, salesSlabs, quantities]);

  const displayResult = calculationResult ?? localResult;

  const setQuantities = (updater) => {
    setSalesDraft((prev) => ({
      ...prev,
      quantities: typeof updater === 'function' ? updater(prev.quantities) : updater,
    }));
  };

  const setMonth = (value) => setSalesDraft((prev) => ({ ...prev, month: value }));
  const setYear = (value) => setSalesDraft((prev) => ({ ...prev, year: value }));

  const slabsByCarId = useMemo(
    () =>
      salesSlabs.reduce((acc, slab) => {
        const carId = slab.carModel?.id;
        if (!carId) return acc;
        if (!acc[carId]) acc[carId] = [];
        acc[carId].push(slab);
        return acc;
      }, {}),
    [salesSlabs]
  );

  const breakdownByCarId = useMemo(() => {
    const map = {};
    for (const line of displayResult?.breakdown || []) {
      map[line.carId] = line;
    }
    return map;
  }, [displayResult]);

  const periodLabel = useMemo(() => {
    const monthName = new Date(0, month - 1).toLocaleString('default', { month: 'long' });
    return `${monthName} ${year}`;
  }, [month, year]);

  const handleQuantityChange = (carId, value) => {
    const parsed = parseInt(value, 10);
    setQuantities((prev) => ({
      ...prev,
      [carId]: isNaN(parsed) || parsed < 0 ? 0 : parsed,
    }));
  };

  useEffect(() => {
    if (!isSalesReady) return;

    const items = Object.entries(quantities)
      .map(([carId, quantity]) => ({
        carId: parseInt(carId, 10),
        quantity,
      }))
      .filter((i) => i.quantity > 0);

    if (items.length === 0) {
      setSalesDraft((prev) => ({ ...prev, calculationResult: null }));
      return;
    }

    const requestId = ++syncRequestRef.current;
    const timer = setTimeout(async () => {
      try {
        const res = await api.post('/sales/calculate', { month, year, items });
        if (syncRequestRef.current === requestId) {
          setSalesDraft((prev) => ({ ...prev, calculationResult: res.data }));
        }
      } catch (err) {
        if (syncRequestRef.current === requestId) {
          const message = err.response?.data?.error || 'Failed to sync calculation with server';
          toast.error(message);
          setSalesDraft((prev) => ({ ...prev, calculationResult: null }));
        }
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [quantities, month, year, isSalesReady, setSalesDraft]);

  const handleSaveSubmission = async () => {
    const items = Object.entries(quantities)
      .map(([carId, quantity]) => ({
        carId: parseInt(carId, 10),
        quantity,
      }))
      .filter((i) => i.quantity > 0);

    if (items.length === 0) {
      toast.error('Enter at least 1 car sale to save');
      return;
    }

    try {
      const res = await api.post('/sales/submissions', { month, year, items });
      const wasUpdate = res.data.updated;
      toast.success(wasUpdate ? 'Submission updated successfully' : 'Submission saved successfully');
      resetSalesDraft();
      await refreshSubmissions();
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to save submission';
      toast.error(message);
    }
  };

  const hasEntries = (displayResult?.totalCars || 0) > 0;

  const renderCarRow = (car) => {
    const line = breakdownByCarId[car.id];
    const modelSlabs = (slabsByCarId[car.id] || []).sort((a, b) => a.minCars - b.minCars);
    const qty = quantities[car.id] || 0;
    const hasQty = qty > 0;
    return { line, modelSlabs, qty, hasQty };
  };

  return (
    <div className={`space-y-6 ${refreshing ? 'opacity-90 transition-opacity' : ''}`}>
      <PageHeader
        eyebrow="Sales officer"
        title="Calculate model incentives"
        description="Enter units sold per model. Each model has its own tiers — gaps use the lower tier rate."
        badge={
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 ring-1 ring-slate-200 shadow-sm">
            <CalendarDays className="w-4 h-4 text-blue-600 shrink-0" />
            {periodLabel}
          </span>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
        {/* Main content */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-5">
          <section className="card">
            <div className="card-header">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-slate-400" />
                Reporting period
              </h2>
            </div>
            <div className="card-body grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-field">Month</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value, 10))}
                  className="select-field"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {new Date(0, m - 1).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-field">Year</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value, 10))}
                  className="input-field"
                />
              </div>
            </div>
          </section>

          <section className="card">
            <div className="card-header flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Car className="w-4 h-4 text-slate-400" />
                Sales entry
              </h2>
              <span className="text-xs text-slate-500 shrink-0">{salesCars.length} models</span>
            </div>

            {!isSalesReady ? (
              <TableSkeleton rows={5} cols={5} />
            ) : salesCars.length === 0 ? (
              <EmptyState icon={Car} title="No active models" description="Contact admin to enable car models." />
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Model</th>
                        <th>Tiers</th>
                        <th>Units</th>
                        <th className="text-right">Rate</th>
                        <th className="text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesCars.map((car) => {
                        const { line, modelSlabs, qty, hasQty } = renderCarRow(car);
                        return (
                          <tr
                            key={car.id}
                            className={hasQty ? 'bg-blue-50/50' : 'hover:bg-slate-50/80'}
                          >
                            <td className="font-medium text-slate-900">{formatCarLabel(car)}</td>
                            <td>
                              {modelSlabs.length === 0 ? (
                                <span className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-md ring-1 ring-amber-200/60">
                                  No tiers
                                </span>
                              ) : (
                                <div className="flex flex-wrap gap-2 max-w-[14rem] sm:mr-5">
                                  {modelSlabs.map((s) => (
                                    <SlabBadge key={s.id} slab={s} />
                                  ))}
                                </div>
                              )}
                            </td>
                            <td>
                              <QtyInput
                                carId={car.id}
                                initialValue={qty}
                                onChange={handleQuantityChange}
                                className="input-field max-w-[5rem] text-center font-semibold"
                              />
                            </td>
                            <td className="text-right text-sm font-semibold text-emerald-600">
                              {line ? formatRupee(line.incentivePerCar) : hasQty ? formatRupee(0) : '—'}
                            </td>
                            <td className="text-right text-sm font-bold text-slate-900">
                              {line ? formatRupee(line.lineIncentive) : hasQty ? formatRupee(0) : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden card-body space-y-3 pt-0">
                  {salesCars.map((car) => {
                    const { line, modelSlabs, qty, hasQty } = renderCarRow(car);
                    return (
                      <div
                        key={car.id}
                        className={`mobile-data-card ${hasQty ? 'ring-blue-200 bg-blue-50/30' : ''}`}
                      >
                        <p className="font-semibold text-slate-900">{formatCarLabel(car)}</p>
                        <div className="flex flex-wrap gap-1">
                          {modelSlabs.length === 0 ? (
                            <span className="text-xs text-amber-700">No tiers configured</span>
                          ) : (
                            modelSlabs.map((s) => <SlabBadge key={s.id} slab={s} />)
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3 items-end">
                          <div>
                            <label className="label-field">Units</label>
                            <QtyInput
                              carId={car.id}
                              initialValue={qty}
                              onChange={handleQuantityChange}
                              className="input-field text-center font-semibold"
                            />
                          </div>
                          <div className="text-right">
                            <p className="label-field">Line total</p>
                            <p className="text-lg font-bold text-slate-900">
                              {line ? formatRupee(line.lineIncentive) : hasQty ? formatRupee(0) : '—'}
                            </p>
                            {line && (
                              <p className="text-xs text-emerald-600">{formatRupee(line.incentivePerCar)}/unit</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </section>

          <div className="flex items-start gap-2 rounded-xl bg-blue-50/80 px-4 py-3 text-sm text-blue-800 ring-1 ring-blue-100">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
            <p>
              Quantities between defined tiers automatically use the nearest lower tier rate. Contact
              your admin if a model shows &quot;No tiers configured&quot;.
            </p>
          </div>
        </div>

        {/* Sidebar summary */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="lg:sticky lg:top-6 space-y-4">
            <section className="card shadow-md">
              <div className="h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500" />
              <div className="card-body">
                <div className="flex items-center gap-2 mb-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <IndianRupee className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Payout summary</h2>
                    <p className="text-xs text-slate-500">{periodLabel}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Units sold
                    </p>
                    <p className="mt-1 text-2xl font-bold text-slate-900 tabular-nums">
                      {displayResult?.totalCars || 0}
                    </p>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-3 ring-1 ring-blue-100/80">
                    <p className="text-xs font-medium text-blue-700/80 uppercase tracking-wide">
                      Total payout
                    </p>
                    <p className="mt-1 text-xl font-bold text-blue-700 tabular-nums leading-tight">
                      {formatRupee(displayResult?.totalIncentive || 0)}
                    </p>
                  </div>
                </div>

                <div className="mb-5">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    Breakdown by model
                  </h3>
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {!hasEntries ? (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center">
                        <Calculator className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        <p className="text-sm text-slate-500">Enter units to preview payout</p>
                      </div>
                    ) : (
                      displayResult.breakdown.map((line) => (
                        <div
                          key={line.carId}
                          className="flex items-start justify-between gap-3 rounded-xl bg-slate-50 px-3.5 py-3 ring-1 ring-slate-100"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">
                              {line.carModelName}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {line.quantity} × {formatRupee(line.incentivePerCar)}
                            </p>
                            {line.lowerTierFallback && (
                              <span className="inline-block mt-1 text-[10px] font-medium uppercase tracking-wide text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                                Lower tier
                              </span>
                            )}
                            {line.matchedSlabId == null && line.quantity > 0 && (
                              <span className="inline-block mt-1 text-[10px] font-medium uppercase tracking-wide text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                Below min tier
                              </span>
                            )}
                          </div>
                          <span className="text-sm font-bold text-slate-900 shrink-0 tabular-nums">
                            {formatRupee(line.lineIncentive)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveSubmission}
                  disabled={!hasEntries}
                  className="btn-primary w-full py-3.5"
                >
                  <Save className="w-4 h-4" />
                  Save monthly submission
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
