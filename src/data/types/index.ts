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

export type RequestStatus =
  | "draft"
  | "published"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "archived";

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
  industries?: string[];
  hasProduction: boolean;
  rating: number;
  reviewCount: number;
  description: string;
  displayName?: string;
  actualAddress?: string;
  website?: string;
  phone?: string;
  logoUrl?: string;
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
  searchAliases?: string[];
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
  inRsvya?: boolean;
  inSroVz?: boolean;
  portfolio: PortfolioItem[];
  reviews: ContractorReview[];
}

export interface ContractorReview {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  photos?: string[];
  videos?: string[];
}

export interface PortfolioThankYou {
  id: string;
  author: string;
  text: string;
  imageUrl?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  year: string;
  description: string;
  photos: string[];
  videos?: string[];
  links?: string[];
  eventId?: string;
  status?: "draft" | "published";
  mediaUrls?: string[];
  thanksLetters?: PortfolioThankYou[];
}

export interface ServicePhotoCard {
  id: string;
  title: string;
  caption: string;
  imageUrl?: string;
}

export interface ServiceCatalogItem {
  id: string;
  title: string;
  description: string;
  price: number;
  unit: string;
  terms: string;
  additionalTerms: string;
  imageUrl?: string;
}

export interface ServiceCatalog {
  id: string;
  contractorId: string;
  contractorName: string;
  title: string;
  category: string;
  city: string;
  description: string;
  items: ServiceCatalogItem[];
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
  prepaymentPercent?: number;
  guaranteeRefund?: boolean;
  photoCards?: ServicePhotoCard[];
  variants?: { id: string; name: string; price: number }[];
}

export interface CartItem {
  serviceId: string;
  quantity: number;
  comment: string;
  files: string[];
  variantId?: string;
  variantName?: string;
  unitPrice?: number;
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
  responseDeadlineAt?: string;
  description: string;
  requirements: string;
  expectedResult: string;
  eventId?: string;
  invitedContractorIds: string[];
  responseCount: number;
  publishedAt?: string;
  customerId: string;
  customerName?: string;
  torSections: TorSection[];
  files: string[];
  cloudLinks?: string;
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

export interface DealReview {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  photos?: string[];
  videos?: string[];
  status: "pending_moderation" | "published";
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

export interface ProjectTimelineRow {
  id: string;
  dealId: string;
  title: string;
  startDate: string;
  endDate: string;
  status: DealStage["status"];
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
  review?: DealReview;
  projectPhotos?: string[];
  reviewRequested?: boolean;
  reviewRequestedAt?: string;
  eventId?: string;
  buyerOrgId?: string;
  sellerOrgId?: string;
  serviceProviderOrgId?: string;
  customerOrgId?: string;
  eventOrganizerOrgId?: string;
  venueOrgId?: string;
}

export type EventOrderType =
  | "space_booking"
  | "passes"
  | "accreditation"
  | "stand_build"
  | "venue_service"
  | "other";

export type EventOrderPriority = "high" | "medium" | "normal";

export type EventOrderCustomerRole =
  | "organizer"
  | "exhibitor"
  | "contractor"
  | "venue"
  | "general_contractor";

export interface EventOrder {
  id: string;
  eventId: string;
  venueId: string;
  title: string;
  type: EventOrderType;
  priority: EventOrderPriority;
  customerRole: EventOrderCustomerRole;
  customerName: string;
  status: DealStatus | "pending" | "completed";
  amount?: number;
  dealId?: string;
  requestId?: string;
  bookingId?: string;
  direction?: "incoming" | "outgoing";
  buyerOrgId?: string;
  sellerOrgId?: string;
  serviceProviderOrgId?: string;
  customerOrgId?: string;
  eventOrganizerOrgId?: string;
  venueOrgId?: string;
}

export interface Document {
  id: string;
  type: string;
  number: string;
  dealId?: string;
  orderId?: string;
  bookingId?: string;
  date: string;
  parties: string;
  status: "draft" | "sent" | "signed" | "archived";
  direction?: "incoming" | "outgoing";
  eventId?: string;
  organizerId?: string;
  organizerName?: string;
  venueId?: string;
  buyerOrgId?: string;
  sellerOrgId?: string;
}

export type FinanceKind = "invoice" | "payment" | "escrow" | "payout" | "refund";
export type FinanceBasisType = "order" | "deal" | "event";

export interface Payment {
  id: string;
  number?: string;
  dealId?: string;
  orderId?: string;
  bookingId?: string;
  ledgerPairId?: string;
  invoiceId?: string;
  escrowId?: string;
  paymentId?: string;
  kind?: FinanceKind;
  currency?: string;
  type: string;
  amount: number;
  status: "pending" | "paid" | "reserved" | "refunded";
  date: string;
  issuedAt?: string;
  dueAt?: string;
  description: string;
  direction?: "incoming" | "outgoing";
  venueId?: string;
  eventId?: string;
  organizerId?: string;
  organizerName?: string;
  participantRole?: "organizer" | "exhibitor" | "contractor" | "venue";
  counterpartyName?: string;
  payerName?: string;
  payeeName?: string;
  payerOrgId?: string;
  payeeOrgId?: string;
  basisType?: FinanceBasisType;
  basisId?: string;
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
  eventId?: string;
  audience?: UserRole;
}

export type MessageCategory = "system" | "customer" | "contractor" | "venue" | "organizer";

export type EntityType =
  | "event"
  | "venue"
  | "request"
  | "order"
  | "deal"
  | "invoice"
  | "document"
  | "booking"
  | "support";

export interface EntityRef {
  type: EntityType;
  id: string;
}

export interface MessageThread {
  id: string;
  title: string;
  category: MessageCategory;
  contextType: EntityType;
  contextId: string;
  relatedType: string;
  relatedId: string;
  relatedLink: string;
  lastMessage: string;
  lastDate: string;
  unread: number;
  participantRoles?: Exclude<UserRole, null>[];
  messages: { id: string; sender: string; text: string; date: string; files: string[] }[];
}

export interface VenuePavilion {
  id: string;
  venueId: string;
  name: string;
  description?: string;
}

export interface VenueHall {
  id: string;
  venueId: string;
  pavilionId: string;
  name: string;
  area: number;
  capacity: number;
  available: boolean;
  widthMeters?: number;
  lengthMeters?: number;
  planCoords?: string;
  powerKw?: number;
  constraints?: string;
}

export interface FloorCell {
  id: string;
  label: string;
  status: FloorCellStatus;
  hallId: string;
  areaSqm?: number;
  widthMeters?: number;
  lengthMeters?: number;
  pricePerSqm?: number;
  powerKw?: number;
  planCoords?: string;
  taxNote?: string;
}

export interface Booking {
  id: string;
  eventId: string;
  venueId: string;
  cellId?: string;
  hallId?: string;
  bookedAreaSqm?: number;
  customerId?: string;
  organizerId?: string;
  organizerName?: string;
  status: "pending" | "confirmed" | "rejected" | "cancelled";
  rejectReason?: string;
  date: string;
  periodType?: "setup" | "event" | "teardown";
  periodStart?: string;
  periodEnd?: string;
  inquiryId?: string;
  holdUntil?: string;
  cancellationTerms?: string;
  changeRequest?: {
    status: "pending" | "accepted" | "rejected";
    actor: "organizer" | "venue";
    periodStart: string;
    periodEnd: string;
    reason: string;
  };
}

export interface Participant {
  id: string;
  eventId: string;
  name: string;
  status: string;
  applicationDate?: string;
  assignedSpace?: string;
  paid: boolean;
  documents: string[];
}

export type OrganizerServiceAudience = "exhibitor" | "contractor";

export interface OrganizerEventService {
  id: string;
  eventId: string;
  title: string;
  price: string;
  active: boolean;
  audiences: OrganizerServiceAudience[];
}

export type EventPartnerCategoryId = "build" | "logistics" | "hotel" | "design";

export interface EventRecommendedPartner {
  id: string;
  eventId: string;
  categoryId: EventPartnerCategoryId;
  contractorId?: string;
  customName?: string;
  customDescription?: string;
  isRecommended: boolean;
}

export type VenueServiceAudience = "organizer" | "contractor" | "exhibitor" | "individual";

export interface VenueService {
  id: string;
  venueId: string;
  title: string;
  price: string;
  active: boolean;
  audiences: VenueServiceAudience[];
}

export type VenueEmployeeStatus = "active" | "invited" | "pending_edo";

export type VenuePermissionSection =
  | "dashboard"
  | "profile"
  | "halls"
  | "events"
  | "venue-services"
  | "bookings"
  | "orders"
  | "payments"
  | "documents";

export interface VenueEmployee {
  id: string;
  venueId: string;
  fullName: string;
  email: string;
  phone: string;
  isAdmin: boolean;
  status: VenueEmployeeStatus;
  edoVerified: boolean;
  permissions: VenuePermissionSection[];
  pinLoginEnabled: boolean;
  invitedAt?: string;
  joinedAt?: string;
}

export type OrganizerPermissionSection =
  | "dashboard"
  | "profile"
  | "events"
  | "venues"
  | "orders"
  | "payments"
  | "documents";

export interface OrganizerEmployee {
  id: string;
  organizerId: string;
  fullName: string;
  email: string;
  phone: string;
  isAdmin: boolean;
  status: VenueEmployeeStatus;
  edoVerified: boolean;
  permissions: OrganizerPermissionSection[];
  pinLoginEnabled: boolean;
  invitedAt?: string;
  joinedAt?: string;
}

export type CustomerPermissionSection =
  | "dashboard"
  | "profile"
  | "legal"
  | "edo"
  | "favorites"
  | "cart"
  | "responses"
  | "active-projects"
  | "completed-projects"
  | "checks"
  | "payments"
  | "documents";

export interface CustomerEmployee {
  id: string;
  customerId: string;
  fullName: string;
  email: string;
  phone: string;
  isAdmin: boolean;
  status: VenueEmployeeStatus;
  edoVerified: boolean;
  permissions: CustomerPermissionSection[];
  pinLoginEnabled: boolean;
  invitedAt?: string;
  joinedAt?: string;
}

export type ContractorPermissionSection =
  | "dashboard"
  | "profile"
  | "cities"
  | "production"
  | "services"
  | "portfolio"
  | "available-requests"
  | "my-responses"
  | "active-projects"
  | "gantt"
  | "completed-projects"
  | "payouts"
  | "documents"
  | "reviews";

export interface ContractorEmployee {
  id: string;
  contractorId: string;
  fullName: string;
  email: string;
  phone: string;
  isAdmin: boolean;
  status: VenueEmployeeStatus;
  edoVerified: boolean;
  permissions: ContractorPermissionSection[];
  pinLoginEnabled: boolean;
  invitedAt?: string;
  joinedAt?: string;
}

export interface VenueEventMeta {
  id: string;
  eventId: string;
  venueId: string;
  hallIds: string[];
  rentedAreaSqm: number;
  freeAreaSqm: number;
  availabilityNotes: string[];
  activeServiceIds: string[];
}

export interface VenueProfileMedia {
  id: string;
  venueId: string;
  type: "photo" | "video";
  category: "venue" | "infrastructure";
  title: string;
  fileName?: string;
}

export interface VenueSpaceBlock {
  id: string;
  venueId: string;
  hallId?: string;
  name: string;
  area: number;
  pricePerSqm: number;
  open: boolean;
}

export interface VenueDailyOccupancy {
  date: string;
  venueId: string;
  percent: number;
}

export type FloorPlanPlotStatus = "available" | "reserved" | "paid" | "unavailable";

export type HallGridFeatureType = "column" | "entrance" | "exit" | "zone";

export interface HallGridConfig {
  hallId: string;
  widthMeters: number;
  heightMeters: number;
  gridStepMeters: number;
}

export interface HallGridFeature {
  id: string;
  hallId: string;
  type: HallGridFeatureType;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
}

export interface FloorPlanPlot {
  id: string;
  label: string;
  hallId: string;
  eventId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  area: number;
  pricePerSqm: number;
  status: FloorPlanPlotStatus;
  companyName?: string;
}

export type VenueInquiryStatus =
  | "pending"
  | "proposal_received"
  | "changes_proposed"
  | "selected"
  | "declined";

export interface OrganizerEventDraft {
  id: string;
  title: string;
  category: Event["category"];
  industry: string;
  description: string;
  city: string;
  startDate: string;
  endDate: string;
  assemblyStart?: string;
  assemblyEnd?: string;
  dismantlingStart?: string;
  dismantlingEnd?: string;
  participationTerms?: string;
  selectedVenueId?: string;
  selectedVenueName?: string;
  updatedAt?: string;
  revision?: number;
}

export interface VenueInquiry {
  id: string;
  eventDraftId: string;
  eventId?: string;
  eventRequestId?: string;
  eventTitle?: string;
  organizerName?: string;
  venueId: string;
  venueName: string;
  dateFrom: string;
  dateTo: string;
  setupStart?: string;
  setupEnd?: string;
  teardownStart?: string;
  teardownEnd?: string;
  minArea?: string;
  requirements?: string;
  hallId?: string;
  alternativeHallId?: string;
  alternativeDateFrom?: string;
  alternativeDateTo?: string;
  declineReason?: string;
  changeReason?: string;
  holdUntil?: string;
  cancellationTerms?: string;
  status: VenueInquiryStatus;
  sentAt: string;
  proposalSummary?: string;
  proposalPrice?: string;
  history?: { date: string; action: string; actor: string }[];
}

export type VenueBookingDateStatus = "rented" | "booked" | "negotiating";
