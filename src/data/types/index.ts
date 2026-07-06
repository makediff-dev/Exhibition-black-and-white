export type UserRole = "customer" | "contractor" | "venue" | "organizer" | null;

export type RequestFormat =
  | "safe_deal"
  | "urgent"
  | "open_request"
  | "closed_request";

export type DealStatus =
  | "negotiation"
  | "awaiting_payment"
  | "funds_reserved"
  | "in_progress"
  | "stage_review"
  | "needs_revision"
  | "stage_accepted"
  | "awaiting_payout"
  | "completed"
  | "dispute";

export type RequestStatus = "draft" | "published" | "in_progress" | "completed";

export type ModerationStatus =
  | "pending"
  | "approved"
  | "needs_clarification"
  | "rejected";

export type EdoStatus = "connected" | "not_connected" | "pending";

export type NotificationPriority =
  | "action_required"
  | "deadline"
  | "info";

export type FloorCellStatus = "free" | "selected" | "booked" | "unavailable";

export interface CompanyProfile {
  id: string;
  name: string;
  inn: string;
  ogrn: string;
  address: string;
  director: string;
  mainOkved: string;
  additionalOkved: string[];
  role: UserRole;
  edoStatus: EdoStatus;
  moderationStatus: ModerationStatus;
  verified: boolean;
  cities: string[];
  categories: string[];
  hasProduction: boolean;
  rating: number;
  reviewCount: number;
  description: string;
}

export interface Event {
  id: string;
  title: string;
  city: string;
  venue: string;
  venueId: string;
  startDate: string;
  endDate: string;
  category: "exhibition" | "forum" | "conference";
  industry: string;
  description: string;
  participationTerms: string;
  bookingAvailable: boolean;
  okvedTags: string[];
  organizerId: string;
  relatedServiceIds: string[];
}

export interface Contractor {
  id: string;
  companyId: string;
  name: string;
  city: string;
  description: string;
  categories: string[];
  geography: string;
  hasProduction: boolean;
  rating: number;
  reviewCount: number;
  verified: boolean;
  portfolio: { id: string; title: string; year: string }[];
  reviews: { id: string; author: string; rating: number; text: string; date: string }[];
}

export interface Service {
  id: string;
  title: string;
  city: string;
  contractorId: string;
  contractorName: string;
  category: string;
  price: number;
  priceFormat: string;
  description: string;
  terms: string;
  deadline: string;
  rating: number;
  reviewCount: number;
  variants?: { id: string; name: string; price: number }[];
}

export interface CartItem {
  serviceId: string;
  quantity: number;
  comment: string;
  files: string[];
}

export interface TorSection {
  id: string;
  title: string;
  content: string;
  required: boolean;
}

export interface EstimateSection {
  id: string;
  title: string;
  items: EstimateItem[];
}

export interface EstimateItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  hidden: boolean;
}

export interface Request {
  id: string;
  title: string;
  format: RequestFormat;
  category: string;
  city: string;
  cities: string[];
  status: RequestStatus;
  budget: { type: string; min?: number; max?: number; hidden?: boolean };
  deadline: string;
  description: string;
  requirements: string;
  expectedResult: string;
  eventId?: string;
  invitedContractorIds: string[];
  responseCount: number;
  publishedAt?: string;
  customerId: string;
  torSections: TorSection[];
  files: string[];
  history: { date: string; action: string }[];
}

export interface Response {
  id: string;
  requestId: string;
  contractorId: string;
  contractorName: string;
  price: number;
  deadline: string;
  terms: string;
  comment: string;
  approach: string;
  status: "pending" | "accepted" | "rejected";
  rating: number;
  validUntil: string;
  estimate: EstimateSection[];
  files: string[];
}

export interface DealStage {
  id: string;
  title: string;
  description: string;
  price: number;
  deadline: string;
  status: "pending" | "in_progress" | "review" | "accepted" | "revision";
  result?: string;
  files: string[];
  comments: string[];
}

export interface Deal {
  id: string;
  number: string;
  title: string;
  format: RequestFormat;
  customerId: string;
  customerName: string;
  contractorId: string;
  contractorName: string;
  totalPrice: number;
  status: DealStatus;
  stages: DealStage[];
  requestId?: string;
  history: { date: string; action: string; actor: string }[];
  documents: string[];
  commission: number;
}

export interface Document {
  id: string;
  type: string;
  number: string;
  dealId: string;
  date: string;
  parties: string;
  status: "draft" | "sent" | "signed" | "archived";
}

export interface Payment {
  id: string;
  dealId: string;
  type: string;
  amount: number;
  status: "pending" | "paid" | "reserved" | "refunded";
  date: string;
  description: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  read: boolean;
  date: string;
  link: string;
  category: string;
}

export interface MessageThread {
  id: string;
  title: string;
  relatedType: string;
  relatedId: string;
  relatedLink: string;
  lastMessage: string;
  lastDate: string;
  unread: number;
  messages: { id: string; sender: string; text: string; date: string; files: string[] }[];
}

export interface VenueHall {
  id: string;
  venueId: string;
  name: string;
  area: number;
  capacity: number;
  available: boolean;
}

export interface FloorCell {
  id: string;
  label: string;
  status: FloorCellStatus;
  hallId: string;
}

export interface Booking {
  id: string;
  eventId: string;
  venueId: string;
  cellId: string;
  customerId: string;
  status: "pending" | "confirmed" | "rejected";
  date: string;
}

export interface Participant {
  id: string;
  eventId: string;
  name: string;
  status: string;
  assignedSpace?: string;
  paid: boolean;
  documents: string[];
}
