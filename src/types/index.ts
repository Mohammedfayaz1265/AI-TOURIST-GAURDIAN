/**
 * AI Tourist Guardian - Shared Domain Types & Interfaces
 */

export type UserRole =
  | 'TOURIST_NATIONAL'
  | 'TOURIST_INTERNATIONAL'
  | 'TOURISM_AUTHORITY'
  | 'EVENT_ORGANIZER'
  | 'SECURITY_POLICE'
  | 'MEDICAL_RESPONDER'
  | 'HOTEL'
  | 'ADMIN';

export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phoneNumber?: string;
  preferredLanguage?: string;
  status: AccountStatus;
  dob?: string;
  gender?: string;
  countryOfResidence?: string;
  onboardingStep?: number;
  onboardingComplete?: boolean;
  createdAt: string;
  updatedAt?: string;
  isTestAccount?: boolean;
}

export type TouristType = 'NATIONAL' | 'INTERNATIONAL';
export type SafetyStatusLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type TripStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface SafetyPreferences {
  crowdAlerts: boolean;
  weatherAlerts: boolean;
  roadAlerts: boolean;
  eventAlerts: boolean;
  transportAlerts: boolean;
  emergencyAlerts: boolean;
  healthAlerts: boolean;
}

export interface TouristProfile {
  userId: string;
  touristType: TouristType;
  nationality?: string;
  passportNumberMasked?: string;
  visaType?: string;
  visaNumberMasked?: string;
  arrivalDate?: string;
  expectedDepartureDate?: string;
  travelPurpose?: string;
  originCity?: string;
  embassyContact?: {
    country: string;
    embassyName: string;
    phone: string;
    email: string;
    address: string;
    source: 'OFFICIAL_REGISTRY' | 'MANUAL_ENTRY';
  };
  activeTripId?: string;
  safetyReadinessStatus: SafetyStatusLevel;
  specialAssistance?: string;
  safetyPreferences?: SafetyPreferences;
  locationConsent?: {
    granted: boolean;
    trackingStatus: 'ACTIVE' | 'DENIED' | 'COARSE_ONLY' | 'NOT_REQUESTED';
    timestamp: string;
  };
  lastKnownLocation?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp: string;
    zoneName?: string;
  };
  locationSharingEnabled: boolean;
  lastSyncedAt?: string;
  updatedAt?: string;
}

export type ConsentPurpose =
  | 'LOCATION'
  | 'EMERGENCY_DATA'
  | 'DOCUMENT_ACCESS'
  | 'NOTIFICATIONS'
  | 'PUBLIC_FEEDBACK'
  | 'PHOTO_SHARING'
  | 'AI_PERSONALIZATION';

export type ConsentStatus = 'GRANTED' | 'WITHDRAWN' | 'EXPIRED';

export interface ConsentRecord {
  id: string;
  userId: string;
  purpose: ConsentPurpose;
  scope: string;
  status: ConsentStatus;
  version: string;
  consentTextVersion: string;
  createdAt: string;
  updatedAt?: string;
  withdrawnAt?: string;
}

export type TripSafetyCheckStatus =
  | 'NOT_STARTED'
  | 'SCHEDULED'
  | 'NOTIFICATION_1_SENT'
  | 'NOTIFICATION_2_SENT'
  | 'NOTIFICATION_3_SENT'
  | 'RESPONDED'
  | 'UNRESPONDED'
  | 'MANUAL_FOLLOWUP_REQUIRED';

export interface Trip {
  id: string;
  touristId: string;
  title: string;
  startingLocation?: string;
  destinations: string[];
  startDate: string;
  startTime?: string;
  endDate: string;
  expectedReturnDate?: string;
  accommodationName?: string;
  accommodationAddress?: string;
  accommodationContact?: string;
  accommodationVerified?: boolean;
  accommodationVerificationStatus?: 'PENDING_VERIFICATION' | 'VERIFIED' | 'VERIFICATION_UNAVAILABLE' | 'REPORTED_SUSPICIOUS';
  hotelId?: string;
  travelMode?: string;
  travellerCount?: number;
  itineraryNotes?: string;
  status: TripStatus;
  riskLevel: SafetyStatusLevel;
  safetyCheckStatus?: TripSafetyCheckStatus;
  lastSafetyCheckAt?: string;
  safetyCheckRespondedAt?: string;
  safetyCheckResponseType?: 'SAFE' | 'NEED_HELP';
  activities?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  relationship: string;
  phone: string;
  country?: string;
  preferredContactMethod?: 'SMS' | 'PHONE' | 'WHATSAPP' | 'EMAIL';
  email?: string;
  priority: 'PRIMARY' | 'SECONDARY';
  verified?: boolean;
  createdAt: string;
}

export interface AccommodationRecord {
  id: string;
  name: string;
  address: string;
  contactPhone: string;
  city?: string;
  verificationStatus: 'PENDING_VERIFICATION' | 'VERIFIED' | 'VERIFICATION_UNAVAILABLE' | 'REPORTED_SUSPICIOUS';
  licenseNumber?: string;
  isSuspicious?: boolean;
  suspiciousReportsCount?: number;
  reportedBy?: string[];
  createdAt: string;
}

export interface FollowUpTask {
  id: string;
  tripId: string;
  touristId: string;
  touristName: string;
  touristPhone?: string;
  reason: string;
  status: 'PENDING_MANUAL_CALL' | 'CALLED_SAFE' | 'ESCALATED_INCIDENT' | 'RESOLVED';
  operatorNotes?: string;
  assignedOperator?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SMSLog {
  id: string;
  to: string;
  message: string;
  provider: 'TextBee' | 'InternalGateway';
  status: 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED' | 'RESPONDED';
  sentAt: string;
  responseReceived?: string;
  error?: string;
}

export type DocumentType =
  | 'PASSPORT'
  | 'VISA'
  | 'NATIONAL_ID'
  | 'TRAVEL_INSURANCE'
  | 'TICKET'
  | 'HOTEL_BOOKING'
  | 'OTHER';

export type DocumentVerificationStatus =
  | 'PENDING'
  | 'SUBMITTED'
  | 'VERIFIED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'MANUAL_REVIEW'
  | 'INTEGRATION_UNAVAILABLE';

export interface TravelDocument {
  id: string;
  userId: string;
  type: DocumentType;
  fileName: string;
  fileSize: number;
  verificationStatus: DocumentVerificationStatus;
  verificationSource: string;
  verificationTimestamp?: string;
  expiryDate?: string;
  maskedIdNumber?: string;
  createdAt: string;
}

export type HotelVerificationStatus = 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';

export interface HotelProfile {
  id: string;
  name: string;
  address: string;
  contactPhone: string;
  licenseNumber: string;
  capacity?: number;
  verificationStatus: HotelVerificationStatus;
  verificationSource: string;
  verificationDate?: string;
  safetyFacilities: string[];
  managerUserId: string;
  rating?: number;
  createdAt: string;
}

export type ZoneRiskStatus = 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';

export interface EventZone {
  id: string;
  eventId: string;
  name: string;
  capacity: number;
  currentCount: number;
  entryFlow: number;
  exitFlow: number;
  status: ZoneRiskStatus;
  densityRatio: number;
  lastUpdated: string;
}

export interface TourismEvent {
  id: string;
  organizerId: string;
  name: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  totalCapacity: number;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  zones: EventZone[];
  createdAt: string;
}

export type AlertType =
  | 'CROWD'
  | 'WEATHER'
  | 'ROAD'
  | 'TRANSPORT'
  | 'EVENT'
  | 'ZONE_CLOSURE'
  | 'INCIDENT'
  | 'EMERGENCY'
  | 'OFFICIAL'
  | 'ACCOMMODATION'
  | 'SYSTEM';

export type AlertSeverity = 'INFO' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface SafetyAlert {
  id: string;
  title: string;
  description: string;
  type: AlertType;
  severity: AlertSeverity;
  location: string;
  radiusKm?: number;
  source: string;
  authorId?: string;
  authorRole?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'RESOLVED';
  createdAt: string;
  expiresAt?: string;
}

export type IncidentType =
  | 'SOS'
  | 'MEDICAL'
  | 'SAFETY'
  | 'MISSING_PERSON'
  | 'CROWD'
  | 'FIRE'
  | 'ACCIDENT'
  | 'OTHER';

export type IncidentStatus =
  | 'CREATED'
  | 'ACKNOWLEDGED'
  | 'ASSIGNED'
  | 'RESPONDER_EN_ROUTE'
  | 'ON_SCENE'
  | 'RESOLVED'
  | 'CLOSED';

export interface IncidentAction {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  notes?: string;
}

export interface Incident {
  id: string;
  touristId: string;
  touristName: string;
  touristPhone?: string;
  touristType?: TouristType;
  type: IncidentType;
  severity: SafetyStatusLevel;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
    zoneName?: string;
  };
  locationDescription?: string;
  description: string;
  consentState?: {
    locationShared: boolean;
    emergencyDataShared: boolean;
  };
  assignedTeam?: string;
  assignedResponderId?: string;
  assignedResponderName?: string;
  status: IncidentStatus;
  escalationLevel: number;
  externalDispatchStatus: 'NOT_CONNECTED_IN_DEV' | 'PENDING_OFFICIAL_DISPATCH' | 'OFFICIAL_DISPATCHED';
  actions: IncidentAction[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface InAppNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  createdAt: string;
  readAt?: string;
}

export interface TripFeedback {
  id: string;
  tripId: string;
  touristId: string;
  touristName: string;
  overallRating: number;
  safetyRating: number;
  cleanlinessRating: number;
  crowdingRating: number;
  transportRating: number;
  accommodationRating: number;
  accessibilityRating: number;
  comment: string;
  consentLevel: 'PRIVATE' | 'SHARE_FOR_SERVICE_IMPROVEMENT' | 'PUBLIC_HIGHLIGHT';
  moderationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  photoUrl?: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorEmail?: string;
  actorRole: UserRole | 'SYSTEM';
  action: string;
  resource: string;
  resourceId?: string;
  timestamp: string;
  result: 'SUCCESS' | 'DENIED' | 'FAILED';
  details?: Record<string, unknown>;
  ipAddress?: string;
}

export type IntegrationStatus = 'CONNECTED' | 'NOT_CONFIGURED' | 'PENDING_AUTHORIZATION' | 'ERROR';

export interface IntegrationCardStatus {
  name: string;
  category: string;
  status: IntegrationStatus;
  provider: string;
  details: string;
  lastChecked: string;
}

export interface SystemHealthReport {
  status: 'OPERATIONAL' | 'DEGRADED' | 'MAINTENANCE';
  timestamp: string;
  database: {
    status: IntegrationStatus;
    provider: string;
    databaseId: string;
  };
  authentication: {
    status: IntegrationStatus;
    provider: string;
  };
  ai: {
    status: IntegrationStatus;
    provider: string;
    model: string;
  };
  maps: {
    status: IntegrationStatus;
    provider: string;
  };
  integrations: IntegrationCardStatus[];
}
