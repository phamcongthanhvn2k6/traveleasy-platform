import api from '../../../services/api';

export interface TripCrewResponse {
  id?: number | null;
  tripId: number;
  tripCode: string;
  route: string;
  departureTime: string;
  arrivalTime: string;
  licensePlate: string;
  busType: string;
  distanceKm: number;

  primaryDriverName?: string | null;
  primaryDriverPhone?: string | null;
  primaryDriverLicense?: string | null;

  secondaryDriverName?: string | null;
  secondaryDriverPhone?: string | null;

  conductorName?: string | null;
  conductorPhone?: string | null;

  continuousDriveHours?: number | null;
  alcoholTested?: boolean | null;
  alcoholReading?: number | null;

  dispatchPermitCode?: string | null;
  dispatchedAt?: string | null;

  status: 'COMPLIANT' | 'COMPLIANT_DISPATCH_READY' | 'DISPATCH_PERMIT_SIGNED' | 'WARNING_OVERTIME' | 'UNASSIGNED';
  notes?: string | null;
}

export interface AssignCrewRequest {
  tripId: number;
  primaryDriverName: string;
  primaryDriverPhone: string;
  primaryDriverLicense?: string;
  secondaryDriverName?: string;
  secondaryDriverPhone?: string;
  conductorName?: string;
  conductorPhone?: string;
  continuousDriveHours?: number;
  alcoholTested: boolean;
  alcoholReading?: number;
  distanceKm?: number;
  notes?: string;
}

export const TripCrewService = {
  getCrewAssignments: async (busCompanyId?: number): Promise<TripCrewResponse[]> => {
    const params = busCompanyId ? { busCompanyId } : {};
    const res = await api.get('/company/crew/assignments', { params });
    return res.data?.data || [];
  },

  assignCrew: async (request: AssignCrewRequest, busCompanyId?: number): Promise<TripCrewResponse> => {
    const params = busCompanyId ? { busCompanyId } : {};
    const res = await api.post('/company/crew/assignments', request, { params });
    return res.data?.data;
  },

  signDispatchPermit: async (tripId: number, busCompanyId?: number): Promise<TripCrewResponse> => {
    const params = busCompanyId ? { busCompanyId } : {};
    const res = await api.post(`/company/crew/trips/${tripId}/dispatch-permit`, {}, { params });
    return res.data?.data;
  }
};
