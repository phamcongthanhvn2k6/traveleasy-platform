export interface Trip {
  id: number;
  busCompanyId: number;
  busCompanyName: string;
  busCompanyLogo?: string;
  routeId: number;
  originCity: string;
  destinationCity: string;
  departureLocation?: string;
  arrivalLocation?: string;
  distanceKm: number;
  durationHours: number;
  departureTime: string;
  arrivalTime: string;
  busType: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  status: string;
}

export interface TripSeat {
  id: number;
  seatNumber: string;
  seatCode?: string;
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

export type PickupDropoffPoint = Point;

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
  passengerName?: string;
  passengerPhone?: string;
  passengerEmail?: string;
  seatNumbers?: string;
  totalPrice?: number;
  busCompanyName?: string;
  departureLocation?: string;
  arrivalLocation?: string;
  departureTime?: string;
  trip?: Trip;
  pickupPointName: string;
  dropoffPointName: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  note?: string;
  createdAt?: string;
  tickets?: Ticket[];
}

export interface DashboardStats {
  totalTrips: number;
  scheduledTrips: number;
  totalBookings: number;
  confirmedBookings: number;
  totalRevenue: number;
  totalUsers: number;
  totalCustomers?: number;
}
