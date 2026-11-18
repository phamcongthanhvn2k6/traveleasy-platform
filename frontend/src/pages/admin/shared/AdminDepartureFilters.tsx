import React from 'react';

interface Props {
  list: {
    filters: { busCompanyId?: number; routeId?: number; departureFrom?: string; departureTo?: string };
    routes: { id: number; busCompanyId: number; busCompanyName: string; departureLocation: string; arrivalLocation: string }[];
    setFilter: (name: 'routeId' | 'departureFrom' | 'departureTo', value: string) => void;
  };
}

const fieldStyle = {
  padding: '8px 10px',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  backgroundColor: '#fff',
  color: '#334155',
  fontSize: '13px',
};

export function AdminDepartureFilters({ list: { filters, routes, setFilter } }: Props) {
  const { busCompanyId, routeId, departureFrom, departureTo } = filters;
  const availableRoutes = busCompanyId ? routes.filter(route => route.busCompanyId === busCompanyId) : routes;

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
      <select aria-label="Tuyến đường" style={fieldStyle} value={routeId ?? ''}
        onChange={event => setFilter('routeId', event.target.value)}>
        <option value="">Tất cả tuyến đường</option>
        {routeId && !availableRoutes.some(route => route.id === routeId) && (
          <option value={routeId}>Tuyến #{routeId}</option>
        )}
        {availableRoutes.map(route => (
          <option key={route.id} value={route.id}>
            {route.departureLocation} → {route.arrivalLocation}{!busCompanyId && ` (${route.busCompanyName})`}
          </option>
        ))}
      </select>
      <label style={{ fontSize: '13px', color: '#475569' }}>
        Xuất bến từ{' '}
        <input type="date" style={fieldStyle} value={departureFrom ?? ''} max={departureTo || undefined}
          onChange={event => setFilter('departureFrom', event.target.value)} />
      </label>
      <label style={{ fontSize: '13px', color: '#475569' }}>
        đến{' '}
        <input type="date" style={fieldStyle} value={departureTo ?? ''} min={departureFrom || undefined}
          onChange={event => setFilter('departureTo', event.target.value)} />
      </label>
    </div>
  );
}
