export interface Trip {
  id: number;
  busCompanyId: number;
  busCompanyName: string;
  busCompanyLogo: string;
  routeId: number;
  originCity: string;
  destinationCity: string;
  distanceKm: number;
  durationHours: number;
  departureTime: string;
  arrivalTime: string;
  busType: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  status: string;
  pickupPoints?: Point[];
  dropoffPoints?: Point[];
}

export interface TripSeat {
  id: number;
  seatNumber: string;
  deck: number;
  status: 'AVAILABLE' | 'BOOKED' | 'LOCKED';
  price: number;
}

export interface Point {
  id: number;
  name: string;
  address: string;
  pointType: 'PICKUP' | 'DROPOFF';
  orderIndex: number;
}

export interface TripDetail {
  trip: Trip;
  seats: TripSeat[];
  pickupPoints: Point[];
  dropoffPoints: Point[];
}

export interface Ticket {
  id: number;
  ticketCode: string;
  seatNumber: string;
  price: number;
  qrCodeHash: string;
  status: string;
  createdAt: string;
}

export interface Booking {
  id: number;
  bookingCode: string;
  userId?: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  trip: Trip;
  pickupPointName: string;
  dropoffPointName: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  note?: string;
  createdAt: string;
  tickets: Ticket[];
}

export interface DashboardStats {
  totalTrips: number;
  scheduledTrips: number;
  totalBookings: number;
  confirmedBookings: number;
  totalRevenue: number;
  totalUsers: number;
}

export interface AuthUser {
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'OPERATOR' | 'CUSTOMER';
  token: string;
}

export interface ScheduleTripItem {
  id: number;
  busCompanyId: number;
  busCompanyName: string;
  busCompanyLogo?: string;
  busCompanyRating?: number;
  departureTime: string;
  arrivalTime: string;
  departureTimeFormatted: string;
  arrivalTimeFormatted: string;
  durationFormatted: string;
  busType: string;
  busTypeName: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  status: string;
  originCity: string;
  destinationCity: string;
  mainPickupPoint: string;
  mainDropoffPoint: string;
  pickupPoints: Point[];
  dropoffPoints: Point[];
}

export interface RouteScheduleResponse {
  routeId: number | null;
  originCity: string;
  destinationCity: string;
  distanceKm: number;
  durationHours: number;
  minPrice: number;
  maxPrice: number;
  totalTrips: number;
  frequency: string;
  outboundTrips: ScheduleTripItem[];
  returnRouteId: number | null;
  inboundTrips: ScheduleTripItem[];
  pickupPoints: Point[];
  dropoffPoints: Point[];
  availableOrigins: string[];
  availableDestinations: string[];
}

export interface RouteOption {
  id: number;
  departureLocation: string;
  arrivalLocation: string;
  distanceKm: number;
  durationHours: number;
}
