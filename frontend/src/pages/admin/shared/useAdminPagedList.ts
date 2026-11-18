import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../../services/api';
import { toast } from '../../../context/ToastContext';

type Filter = 'search' | 'status' | 'busCompanyId' | 'routeId' | 'departureFrom' | 'departureTo';
type Page<T> = { items: T[]; page: number; totalPages: number; totalElements: number };
type Company = { id: number; name: string };
type Route = { id: number; busCompanyId: number; busCompanyName: string; departureLocation: string; arrivalLocation: string };

const PAGE_SIZES = [10, 15, 25, 50, 100];
const statuses = {
  trips: ['SCHEDULED', 'DEPARTED', 'CANCELLED'],
  bookings: ['CONFIRMED', 'PENDING', 'CANCELLED'],
};

function positiveInteger(value: string | null, max = Number.MAX_SAFE_INTEGER) {
  const number = Number(value);
  return value && /^[1-9]\d*$/.test(value) && Number.isSafeInteger(number) && number <= max ? number : undefined;
}

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000')) return false;
  const date = new Date(value + 'T00:00:00Z');
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

export function useAdminPagedList<T, S>(resource: keyof typeof statuses, defaultSize: number) {
  const [url, setUrl] = useSearchParams();
  const [revision, setRevision] = useState(0);
  const [summary, setSummary] = useState<S>();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [result, setResult] = useState<{ key: string; filters: string; page: Page<T> }>();
  const [failedKey, setFailedKey] = useState<string>();
  const lastRequestedSearch = useRef('');

  const search = url.get('search') ?? '';
  const status = url.get('status') ?? '';
  const busCompanyId = positiveInteger(url.get('busCompanyId'));
  const routeId = positiveInteger(url.get('routeId'));
  const departureFrom = url.get('departureFrom') ?? '';
  const departureTo = url.get('departureTo') ?? '';
  const rawSize = positiveInteger(url.get('size'));
  const pageSize = rawSize && PAGE_SIZES.includes(rawSize) ? rawSize : defaultSize;
  const currentPage = positiveInteger(url.get('page'), 2147483648) ?? 1;
  const dateError = (departureFrom && !validDate(departureFrom)) || (departureTo && !validDate(departureTo))
    ? 'Ngày xuất bến không hợp lệ.'
    : departureFrom && departureTo && departureFrom > departureTo
      ? 'Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.'
      : '';
  const filters = useMemo(() => ({
    search: search.trim() || undefined,
    status: statuses[resource].includes(status) ? status : undefined,
    busCompanyId, routeId,
    departureFrom: departureFrom || undefined,
    departureTo: departureTo || undefined,
  }), [search, resource, status, busCompanyId, routeId, departureFrom, departureTo]);
  const filterKey = JSON.stringify(filters);
  const key = JSON.stringify([filterKey, currentPage, pageSize, revision]);

  useEffect(() => {
    const controller = new AbortController();
    api.get<{ data: S }>(`/admin/${resource}/summary`, { signal: controller.signal })
      .then(({ data }) => { if (!controller.signal.aborted) setSummary(data.data); })
      .catch(() => { if (!controller.signal.aborted) toast.error('Không thể tải thống kê.'); });
    return () => controller.abort();
  }, [resource, revision]);

  useEffect(() => {
    const controller = new AbortController();
    const options = { signal: controller.signal };
    api.get<{ data: Company[] }>('/admin/bus-companies', options)
      .then(({ data }) => { if (!controller.signal.aborted) setCompanies(data.data); })
      .catch(() => { if (!controller.signal.aborted) toast.error('Không thể tải danh sách nhà xe.'); });
    api.get<{ data: Route[] }>('/admin/routes', options)
      .then(({ data }) => { if (!controller.signal.aborted) setRoutes(data.data); })
      .catch(() => { if (!controller.signal.aborted) toast.error('Không thể tải danh sách tuyến đường.'); });
    return () => controller.abort();
  }, [revision]);

  useEffect(() => {
    if (dateError) return;
    const controller = new AbortController();
    const load = async () => {
      lastRequestedSearch.current = filters.search ?? '';
      try {
        const { data } = await api.get<{ data: Page<T> }>(`/admin/${resource}/page`, {
          params: { ...filters, page: currentPage - 1, size: pageSize },
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        const lastPage = Math.max(1, data.data.totalPages);
        if (currentPage > lastPage) {
          setUrl(previous => {
            const next = new URLSearchParams(previous);
            if (lastPage === 1) next.delete('page');
            else next.set('page', String(lastPage));
            return next;
          }, { replace: true });
          return;
        }
        setFailedKey(undefined);
        setResult({ key, filters: filterKey, page: data.data });
      } catch {
        if (controller.signal.aborted) return;
        setFailedKey(key);
        toast.error('Không thể tải danh sách. Vui lòng thử lại.');
      }
    };
    const timer = window.setTimeout(load, lastRequestedSearch.current === (filters.search ?? '') ? 0 : 250);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [resource, key, filterKey, currentPage, pageSize, filters, dateError, setUrl]);

  const update = (name: Filter | 'page' | 'size', value: string) => {
    const next = new URLSearchParams(url);
    if (value) next.set(name, value);
    else next.delete(name);
    if (name !== 'page') next.delete('page');
    if (name === 'busCompanyId') {
      const selectedRoute = routes.find(route => route.id === routeId);
      if (value && selectedRoute && String(selectedRoute.busCompanyId) !== value) next.delete('routeId');
    }
    if (next.toString() !== url.toString()) setUrl(next, { replace: name === 'search' });
  };

  const loading = !dateError && result?.key !== key && failedKey !== key;
  const page = !dateError && result?.filters === filterKey ? result.page : undefined;
  return {
    filters, search, dateError, loading, failed: failedKey === key,
    companies, routes, summary, page, currentPage, pageSize, pageSizes: PAGE_SIZES,
    setFilter: (name: Filter, value: string) => update(name, value === 'ALL' && name === 'status' ? '' : value),
    setCurrentPage: (page: number) => update('page', page === 1 ? '' : String(page)),
    setPageSize: (size: number) => update('size', size === defaultSize ? '' : String(size)),
    refresh: () => setRevision(value => value + 1),
  };
}
