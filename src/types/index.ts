export type RoomStatus = 'OCCUPIED' | 'VACANT' | 'RESERVED' | 'OVERDUE' | 'MAINTENANCE';

export type RoomType = 'STUDIO' | 'LOFT' | 'ONE_BED' | 'TWO_BED' | 'DUPLEX';

export type AssetCondition = 'NEW' | 'GOOD' | 'FAIR' | 'DAMAGED';

export type TemporaryResidenceStatus = 'REGISTERED' | 'NOT_REGISTERED' | 'EXPIRING';

export type ContractStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'TERMINATED';

export type InvoiceStatus = 'PAID' | 'UNPAID' | 'OVERDUE';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type TicketStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface UtilityRates {
  electricPrice: number; // VND per kWh (e.g. 3800)
  waterPrice: number; // VND per m3 (e.g. 25000) or per person
  waterBillingType: 'PER_CUBIC' | 'PER_PERSON';
  internetFee: number; // VND per room per month
  garbageFee: number; // VND per room per month
  parkingMotorbikeFee: number; // VND per bike per month
  parkingCarFee: number; // VND per car per month
  serviceFee: number; // general maintenance / elevator fee
}

export interface BankConfig {
  bankCode: string; // e.g. "VCB", "MB", "TCB", "ACB"
  bankName: string; // e.g. "Vietcombank"
  accountNumber: string;
  accountName: string;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  managerName: string;
  totalFloors: number;
  totalRooms: number;
  defaultRates: UtilityRates;
  bankConfig: BankConfig;
  hasElevator: boolean;
  hasSecurity: boolean;
  notes?: string;
}

export interface RoomAsset {
  id: string;
  roomId: string;
  name: string;
  brand: string;
  code: string;
  condition: AssetCondition;
  compensationPrice: number;
  installedDate: string;
  note?: string;
}

export interface RoomMember {
  id: string;
  name: string;
  phone: string;
  cccd: string;
  relation: string; // "Bạn cùng phòng", "Vợ/Chồng", "Em gái"...
  temporaryResidenceStatus: TemporaryResidenceStatus;
}

export interface Tenant {
  id: string;
  roomId: string;
  propertyId: string;
  name: string;
  phone: string;
  email?: string;
  cccd: string;
  cccdIssueDate: string;
  cccdIssuePlace: string;
  birthDate: string;
  hometown: string;
  job: string;
  isRepresentative: boolean;
  temporaryResidenceStatus: TemporaryResidenceStatus;
  temporaryResidenceExpiry?: string;
  vehiclePlate?: string;
  vehicleModel?: string;
  avatarUrl?: string;
  startDate: string;
  members: RoomMember[];
  reputation: 'EXCELLENT' | 'GOOD' | 'NEEDS_ATTENTION';
  notes?: string;
}

export interface Contract {
  id: string;
  code: string; // e.g. "HD-2026-09-P101"
  propertyId: string;
  roomId: string;
  tenantId: string;
  tenantName: string;
  startDate: string;
  endDate: string;
  rentPrice: number;
  depositAmount: number;
  billingDay: number; // e.g. 5th of each month
  paymentCycleMonths: number; // 1 month or 3 months
  paymentCycle?: 'MONTHLY' | 'QUARTERLY';
  terms?: string;
  status: ContractStatus;
  note?: string;
  signedDate: string;
}

export interface UtilityReading {
  id: string;
  propertyId: string;
  roomId: string;
  roomNumber: string;
  month: string; // "2026-09"
  oldElectric: number;
  newElectric: number;
  electricPrice: number;
  oldWater: number;
  newWater: number;
  waterPrice: number;
  garbageFee: number;
  internetFee: number;
  parkingFee: number;
  motorbikeCount: number;
  serviceFee: number;
  otherFee: number;
  otherFeeReason?: string;
  meterPhotoUrl?: string;
  recordedAt: string;
  recordedBy: string;
}

export interface Invoice {
  id: string;
  code: string; // e.g. "HD-202609-101"
  propertyId: string;
  roomId: string;
  roomNumber: string;
  tenantId: string;
  tenantName: string;
  tenantPhone: string;
  month: string; // "2026-09"
  roomPrice: number;
  
  // Electric breakdown
  oldElectric: number;
  newElectric: number;
  electricUsage: number;
  electricRate: number;
  electricTotal: number;

  // Water breakdown
  oldWater: number;
  newWater: number;
  waterUsage: number;
  waterRate: number;
  waterTotal: number;

  // Service fees
  garbageFee: number;
  internetFee: number;
  parkingFee: number;
  serviceFee: number;
  otherFee: number;
  otherFeeReason?: string;

  totalAmount: number;
  paidAmount: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: 'VIETQR' | 'CASH' | 'BANK_TRANSFER';
  transferNote: string;
  qrUrl: string;
}

export interface Room {
  id: string;
  propertyId: string;
  roomNumber: string; // "P.101"
  floor: number;
  type: RoomType;
  basePrice: number;
  price?: number;
  area: number; // in m2
  maxOccupants: number;
  status: RoomStatus;
  currentTenantId?: string;
  currentContractId?: string;
  currentInvoiceId?: string;
  overdueDays?: number;
  amenities: string[];
  notes?: string;
}

export interface MaintenanceTicket {
  id: string;
  propertyId: string;
  roomId: string;
  roomNumber: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  reportedAt: string;
  createdAt?: string;
  reportedBy: string;
  resolvedAt?: string;
  cost: number;
  paidBy: 'OWNER' | 'TENANT';
  technicianName?: string;
  technicianPhone?: string;
}

export interface CashTransaction {
  id: string;
  propertyId: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: string;
  description: string;
  roomId?: string;
  roomNumber?: string;
  invoiceId?: string;
  receiptNumber: string;
}

export interface DashboardSummary {
  totalProperties: number;
  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
  reservedRooms: number;
  overdueRooms: number;
  maintenanceRooms: number;
  occupancyRate: number; // e.g. 88.5%
  monthlyExpectedRevenue: number;
  monthlyCollectedRevenue: number;
  collectionRate: number; // e.g. 75%
  overdueAmount: number;
  monthlyOperatingExpenses: number;
  netProfit: number;
}
