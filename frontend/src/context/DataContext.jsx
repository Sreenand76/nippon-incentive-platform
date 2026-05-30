import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

const emptyState = {
  adminCars: null,
  adminSlabs: null,
  salesCars: null,
  salesSlabs: null,
  submissions: null,
};

const defaultSalesDraft = () => ({
  quantities: {},
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  calculationResult: null,
});

export const DataProvider = ({ children }) => {
  const { user } = useAuth();
  const [data, setData] = useState(emptyState);
  const [salesDraft, setSalesDraft] = useState(defaultSalesDraft);
  const [initialLoading, setInitialLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const loadedKeyRef = useRef(null);

  const loadAll = useCallback(async (currentUser, { silent = false } = {}) => {
    const key = `${currentUser.role}:${currentUser.id}`;

    if (!silent) {
      setInitialLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      if (currentUser.role === 'ROLE_ADMIN') {
        const [carsRes, slabsRes] = await Promise.all([
          api.get('/admin/cars'),
          api.get('/admin/slabs'),
        ]);
        setData((prev) => ({
          ...prev,
          adminCars: carsRes.data,
          adminSlabs: slabsRes.data,
        }));
      } else if (currentUser.role === 'ROLE_SALES_OFFICER') {
        const [carsRes, slabsRes, submissionsRes] = await Promise.all([
          api.get('/sales/cars'),
          api.get('/sales/slabs'),
          api.get('/sales/submissions'),
        ]);
        setData((prev) => ({
          ...prev,
          salesCars: carsRes.data,
          salesSlabs: slabsRes.data,
          submissions: submissionsRes.data,
        }));
      }
      loadedKeyRef.current = key;
    } catch {
      toast.error('Failed to load data');
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setData(emptyState);
      setSalesDraft(defaultSalesDraft());
      loadedKeyRef.current = null;
      return;
    }

    const key = `${user.role}:${user.id}`;
    if (loadedKeyRef.current === key) {
      return;
    }

    loadAll(user);
  }, [user, loadAll]);

  const refreshAdminCars = useCallback(async () => {
    const res = await api.get('/admin/cars');
    setData((prev) => ({ ...prev, adminCars: res.data }));
  }, []);

  const refreshAdminSlabs = useCallback(async () => {
    const res = await api.get('/admin/slabs');
    setData((prev) => ({ ...prev, adminSlabs: res.data }));
  }, []);

  const refreshSalesCatalog = useCallback(async () => {
    const [carsRes, slabsRes] = await Promise.all([
      api.get('/sales/cars'),
      api.get('/sales/slabs'),
    ]);
    setData((prev) => ({
      ...prev,
      salesCars: carsRes.data,
      salesSlabs: slabsRes.data,
    }));
  }, []);

  const refreshSubmissions = useCallback(async () => {
    const res = await api.get('/sales/submissions');
    setData((prev) => ({ ...prev, submissions: res.data }));
  }, []);

  const isAdminReady = data.adminCars !== null && data.adminSlabs !== null;
  const isSalesReady =
    data.salesCars !== null && data.salesSlabs !== null && data.submissions !== null;

  return (
    <DataContext.Provider
      value={{
        adminCars: data.adminCars ?? [],
        adminSlabs: data.adminSlabs ?? [],
        salesCars: data.salesCars ?? [],
        salesSlabs: data.salesSlabs ?? [],
        submissions: data.submissions ?? [],
        initialLoading,
        refreshing,
        isAdminReady,
        isSalesReady,
        refreshAdminCars,
        refreshAdminSlabs,
        refreshSalesCatalog,
        refreshSubmissions,
        reloadAll: () => user && loadAll(user, { silent: true }),
        salesDraft,
        setSalesDraft,
        resetSalesDraft: () => setSalesDraft(defaultSalesDraft()),
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useData must be used within DataProvider');
  }
  return ctx;
};
