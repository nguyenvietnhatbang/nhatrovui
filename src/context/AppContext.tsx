'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import {
  Property,
  Room,
  Tenant,
  Contract,
  RoomAsset,
  UtilityReading,
  Invoice,
  MaintenanceTicket,
  CashTransaction,
  DashboardSummary,
  RoomStatus,
  TicketStatus,
} from '@/types';
import {
  INITIAL_PROPERTIES,
  INITIAL_ROOMS,
  INITIAL_TENANTS,
  INITIAL_CONTRACTS,
  INITIAL_ROOM_ASSETS,
  INITIAL_UTILITY_READINGS,
  INITIAL_INVOICES,
  INITIAL_MAINTENANCE_TICKETS,
  INITIAL_CASH_TRANSACTIONS,
} from '@/lib/initial-data';
import { generateVietQRUrl, formatTransferSyntax } from '@/lib/vietqr';

interface AppContextType {
  properties: Property[];
  rooms: Room[];
  tenants: Tenant[];
  contracts: Contract[];
  assets: RoomAsset[];
  utilityReadings: UtilityReading[];
  invoices: Invoice[];
  maintenanceTickets: MaintenanceTicket[];
  cashTransactions: CashTransaction[];
  selectedPropertyId: string | null;
  setSelectedPropertyId: (id: string | null) => void;
  selectedProperty: Property | null;
  
  // Computed
  filteredRooms: Room[];
  filteredInvoices: Invoice[];
  filteredTenants: Tenant[];
  filteredContracts: Contract[];
  filteredTickets: MaintenanceTicket[];
  filteredCashTransactions: CashTransaction[];
  dashboardStats: DashboardSummary;

  // Actions
  updateRoomStatus: (roomId: string, status: RoomStatus) => void;
  addTenant: (tenant: Omit<Tenant, 'id'>) => Tenant;
  updateTenant: (tenant: Tenant) => void;
  deleteTenant: (tenantId: string) => void;
  addContract: (contract: Omit<Contract, 'id'>) => Contract;
  updateContract: (contractId: string, updates: Partial<Contract>) => void;
  renewContract: (contractId: string, newEndDate: string, newRentPrice?: number) => void;
  terminateContract: (contractId: string, returnDepositAmount?: number) => void;
  deleteContract: (contractId: string) => void;
  recordUtilityReading: (reading: Omit<UtilityReading, 'id' | 'recordedAt'>) => void;
  saveBatchUtilityReadings: (readings: UtilityReading[]) => void;
  markInvoicePaid: (invoiceId: string, paymentMethod?: 'VIETQR' | 'CASH' | 'BANK_TRANSFER') => void;
  generateInvoicesForMonth: (propertyId: string, month: string) => number;
  addMaintenanceTicket: (ticket: Omit<MaintenanceTicket, 'id' | 'reportedAt'>) => void;
  updateMaintenanceStatus: (ticketId: string, status: TicketStatus, cost?: number, resolvedAt?: string) => void;
  deleteMaintenanceTicket: (ticketId: string) => void;
  addCashTransaction: (transaction: Omit<CashTransaction, 'id' | 'receiptNumber'>) => void;
  updateCashTransaction: (txId: string, updates: Partial<CashTransaction>) => void;
  deleteCashTransaction: (txId: string) => void;
  resetToDefaultData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'tromaster_pms_data_v1';

export function AppProvider({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  // States
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [contracts, setContracts] = useState<Contract[]>(INITIAL_CONTRACTS);
  const [assets, setAssets] = useState<RoomAsset[]>(INITIAL_ROOM_ASSETS);
  const [utilityReadings, setUtilityReadings] = useState<UtilityReading[]>(INITIAL_UTILITY_READINGS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [maintenanceTickets, setMaintenanceTickets] = useState<MaintenanceTicket[]>(INITIAL_MAINTENANCE_TICKETS);
  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>(INITIAL_CASH_TRANSACTIONS);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  // Initialize from LocalStorage
  useEffect(() => {
    setIsClient(true);
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.properties) setProperties(parsed.properties);
        if (parsed.rooms) setRooms(parsed.rooms);
        if (parsed.tenants) setTenants(parsed.tenants);
        if (parsed.contracts) setContracts(parsed.contracts);
        if (parsed.assets) setAssets(parsed.assets);
        if (parsed.utilityReadings) setUtilityReadings(parsed.utilityReadings);
        if (parsed.invoices) setInvoices(parsed.invoices);
        if (parsed.maintenanceTickets) setMaintenanceTickets(parsed.maintenanceTickets);
        if (parsed.cashTransactions) setCashTransactions(parsed.cashTransactions);
      }
    } catch (e) {
      console.error('Failed to load data from localStorage', e);
    }
  }, []);

  // Sync to LocalStorage
  useEffect(() => {
    if (!isClient) return;
    try {
      const payload = {
        properties,
        rooms,
        tenants,
        contracts,
        assets,
        utilityReadings,
        invoices,
        maintenanceTickets,
        cashTransactions,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to save data to localStorage', e);
    }
  }, [
    isClient,
    properties,
    rooms,
    tenants,
    contracts,
    assets,
    utilityReadings,
    invoices,
    maintenanceTickets,
    cashTransactions,
  ]);

  const selectedProperty = useMemo(() => {
    if (!selectedPropertyId) return null;
    return properties.find((p) => p.id === selectedPropertyId) || null;
  }, [properties, selectedPropertyId]);

  // Filtered views based on selected property
  const filteredRooms = useMemo(() => {
    if (!selectedPropertyId) return rooms;
    return rooms.filter((r) => r.propertyId === selectedPropertyId);
  }, [rooms, selectedPropertyId]);

  const filteredInvoices = useMemo(() => {
    if (!selectedPropertyId) return invoices;
    return invoices.filter((i) => i.propertyId === selectedPropertyId);
  }, [invoices, selectedPropertyId]);

  const filteredTenants = useMemo(() => {
    if (!selectedPropertyId) return tenants;
    return tenants.filter((t) => t.propertyId === selectedPropertyId);
  }, [tenants, selectedPropertyId]);

  const filteredContracts = useMemo(() => {
    if (!selectedPropertyId) return contracts;
    return contracts.filter((c) => c.propertyId === selectedPropertyId);
  }, [contracts, selectedPropertyId]);

  const filteredTickets = useMemo(() => {
    if (!selectedPropertyId) return maintenanceTickets;
    return maintenanceTickets.filter((t) => t.propertyId === selectedPropertyId);
  }, [maintenanceTickets, selectedPropertyId]);

  const filteredCashTransactions = useMemo(() => {
    if (!selectedPropertyId) return cashTransactions;
    return cashTransactions.filter((c) => c.propertyId === selectedPropertyId);
  }, [cashTransactions, selectedPropertyId]);

  // Dashboard Summary Metrics
  const dashboardStats: DashboardSummary = useMemo(() => {
    const totalProperties = selectedPropertyId ? 1 : properties.length;
    const totalRooms = filteredRooms.length;
    const occupiedRooms = filteredRooms.filter((r) => r.status === 'OCCUPIED').length;
    const vacantRooms = filteredRooms.filter((r) => r.status === 'VACANT').length;
    const reservedRooms = filteredRooms.filter((r) => r.status === 'RESERVED').length;
    const overdueRooms = filteredRooms.filter((r) => r.status === 'OVERDUE').length;
    const maintenanceRooms = filteredRooms.filter((r) => r.status === 'MAINTENANCE').length;
    const occupancyRate = totalRooms > 0 ? Math.round(((occupiedRooms + overdueRooms) / totalRooms) * 100) : 0;

    // Monthly revenue from current month invoices
    const monthlyExpectedRevenue = filteredInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
    const monthlyCollectedRevenue = filteredInvoices
      .filter((inv) => inv.status === 'PAID')
      .reduce((acc, inv) => acc + inv.paidAmount, 0);
    const overdueAmount = filteredInvoices
      .filter((inv) => inv.status === 'OVERDUE' || inv.status === 'UNPAID')
      .reduce((acc, inv) => acc + (inv.totalAmount - inv.paidAmount), 0);
    const collectionRate =
      monthlyExpectedRevenue > 0 ? Math.round((monthlyCollectedRevenue / monthlyExpectedRevenue) * 100) : 0;

    const monthlyOperatingExpenses = filteredCashTransactions
      .filter((c) => c.type === 'EXPENSE')
      .reduce((acc, c) => acc + c.amount, 0);

    const netProfit = monthlyCollectedRevenue - monthlyOperatingExpenses;

    return {
      totalProperties,
      totalRooms,
      occupiedRooms,
      vacantRooms,
      reservedRooms,
      overdueRooms,
      maintenanceRooms,
      occupancyRate,
      monthlyExpectedRevenue,
      monthlyCollectedRevenue,
      collectionRate,
      overdueAmount,
      monthlyOperatingExpenses,
      netProfit,
    };
  }, [filteredRooms, filteredInvoices, filteredCashTransactions, properties, selectedPropertyId]);

  // Action Handlers
  const updateRoomStatus = (roomId: string, status: RoomStatus) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          return {
            ...r,
            status,
            overdueDays: status === 'OVERDUE' ? r.overdueDays || 3 : undefined,
          };
        }
        return r;
      })
    );
  };

  const addTenant = (tenantData: Omit<Tenant, 'id'>): Tenant => {
    const newId = `tenant-${Date.now()}`;
    const newTenant: Tenant = {
      ...tenantData,
      id: newId,
    };
    setTenants((prev) => [newTenant, ...prev]);

    // Update room occupancy
    setRooms((prev) =>
      prev.map((r) =>
        r.id === tenantData.roomId
          ? { ...r, status: 'OCCUPIED' as RoomStatus, currentTenantId: newId }
          : r
      )
    );

    return newTenant;
  };

  const updateTenant = (updated: Tenant) => {
    setTenants((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const deleteTenant = (tenantId: string) => {
    const target = tenants.find((t) => t.id === tenantId);
    if (target) {
      setRooms((prev) =>
        prev.map((r) =>
          r.id === target.roomId
            ? { ...r, status: 'VACANT' as RoomStatus, currentTenantId: undefined, currentContractId: undefined }
            : r
        )
      );
    }
    setTenants((prev) => prev.filter((t) => t.id !== tenantId));
  };

  const addContract = (contractData: Omit<Contract, 'id'>): Contract => {
    const newId = `contract-${Date.now()}`;
    const newContract: Contract = {
      ...contractData,
      id: newId,
    };
    setContracts((prev) => [newContract, ...prev]);
    setRooms((prev) =>
      prev.map((r) =>
        r.id === contractData.roomId ? { ...r, currentContractId: newId } : r
      )
    );
    return newContract;
  };

  const renewContract = (contractId: string, newEndDate: string, newRentPrice?: number) => {
    setContracts((prev) =>
      prev.map((c) => {
        if (c.id === contractId) {
          return {
            ...c,
            endDate: newEndDate,
            rentPrice: newRentPrice ?? c.rentPrice,
            status: 'ACTIVE' as const,
            note: (c.note ? c.note + ' | ' : '') + `Gia hạn ngày ${new Date().toLocaleDateString('vi-VN')}`,
          };
        }
        return c;
      })
    );
  };

  const terminateContract = (contractId: string) => {
    const contract = contracts.find((c) => c.id === contractId);
    if (!contract) return;

    setContracts((prev) =>
      prev.map((c) => (c.id === contractId ? { ...c, status: 'TERMINATED' as const } : c))
    );

    // Free up room
    setRooms((prev) =>
      prev.map((r) =>
        r.id === contract.roomId
          ? { ...r, status: 'VACANT' as RoomStatus, currentTenantId: undefined, currentContractId: undefined }
          : r
      )
    );
  };

  const updateContract = (contractId: string, updates: Partial<Contract>) => {
    setContracts((prev) =>
      prev.map((c) => (c.id === contractId ? { ...c, ...updates } : c))
    );
  };

  const deleteContract = (contractId: string) => {
    setContracts((prev) => prev.filter((c) => c.id !== contractId));
  };

  const recordUtilityReading = (readingData: Omit<UtilityReading, 'id' | 'recordedAt'>) => {
    const newId = `util-${Date.now()}`;
    const newReading: UtilityReading = {
      ...readingData,
      id: newId,
      recordedAt: new Date().toISOString(),
    };
    setUtilityReadings((prev) => {
      // replace if month exists for room
      const filtered = prev.filter(
        (u) => !(u.roomId === readingData.roomId && u.month === readingData.month)
      );
      return [newReading, ...filtered];
    });
  };

  const saveBatchUtilityReadings = (readings: UtilityReading[]) => {
    setUtilityReadings((prev) => {
      const roomMonthKeys = new Set(readings.map((r) => `${r.roomId}-${r.month}`));
      const untouched = prev.filter((u) => !roomMonthKeys.has(`${u.roomId}-${u.month}`));
      return [...readings, ...untouched];
    });
  };

  const markInvoicePaid = (invoiceId: string, paymentMethod: 'VIETQR' | 'CASH' | 'BANK_TRANSFER' = 'VIETQR') => {
    let paidInvoice: Invoice | undefined;

    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          paidInvoice = {
            ...inv,
            status: 'PAID',
            paidAmount: inv.totalAmount,
            paidDate: new Date().toISOString().split('T')[0],
            paymentMethod,
          };
          return paidInvoice;
        }
        return inv;
      })
    );

    if (paidInvoice) {
      // Turn room to OCCUPIED (if it was overdue)
      const targetRoom = rooms.find((r) => r.id === paidInvoice?.roomId);
      if (targetRoom && targetRoom.status === 'OVERDUE') {
        updateRoomStatus(targetRoom.id, 'OCCUPIED');
      }

      // Add to cashbook
      const newCash: CashTransaction = {
        id: `cash-${Date.now()}`,
        propertyId: paidInvoice.propertyId,
        type: 'INCOME',
        category: 'Tiền phòng & Dịch vụ',
        amount: paidInvoice.totalAmount,
        date: new Date().toISOString().split('T')[0],
        description: `Thanh toán hóa đơn phòng ${paidInvoice.roomNumber} (${paidInvoice.tenantName}) qua ${paymentMethod}`,
        roomId: paidInvoice.roomId,
        roomNumber: paidInvoice.roomNumber,
        invoiceId: paidInvoice.id,
        receiptNumber: `PT-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      };
      setCashTransactions((prev) => [newCash, ...prev]);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        console.error('Confetti trigger error:', err);
      }
    }
  };

  const generateInvoicesForMonth = (propertyId: string, month: string): number => {
    const prop = properties.find((p) => p.id === propertyId);
    if (!prop) return 0;

    const targetRooms = rooms.filter(
      (r) => r.propertyId === propertyId && (r.status === 'OCCUPIED' || r.status === 'OVERDUE')
    );

    let createdCount = 0;
    const newInvoices: Invoice[] = [];

    targetRooms.forEach((room) => {
      // Check if invoice already exists
      const existing = invoices.find((inv) => inv.roomId === room.id && inv.month === month);
      if (existing) return;

      const tenant = tenants.find((t) => t.id === room.currentTenantId);
      const util = utilityReadings.find((u) => u.roomId === room.id && u.month === month);

      const oldE = util?.oldElectric || 0;
      const newE = util?.newElectric || oldE + 120;
      const eUsage = Math.max(0, newE - oldE);
      const eTotal = eUsage * prop.defaultRates.electricPrice;

      const oldW = util?.oldWater || 0;
      const newW = util?.newWater || oldW + 8;
      const wUsage = Math.max(0, newW - oldW);
      const wTotal = wUsage * prop.defaultRates.waterPrice;

      const services =
        prop.defaultRates.garbageFee +
        prop.defaultRates.internetFee +
        prop.defaultRates.serviceFee +
        (util?.parkingFee || prop.defaultRates.parkingMotorbikeFee);

      const total = room.basePrice + eTotal + wTotal + services;
      const transferNote = formatTransferSyntax(prop.name, room.roomNumber, month);

      const inv: Invoice = {
        id: `inv-${room.id}-${month.replace('-', '')}`,
        code: `HD-${month.replace('-', '')}-${room.roomNumber.replace(/\D/g, '')}`,
        propertyId: prop.id,
        roomId: room.id,
        roomNumber: room.roomNumber,
        tenantId: tenant?.id || '',
        tenantName: tenant?.name || 'Khách thuê',
        tenantPhone: tenant?.phone || '',
        month,
        roomPrice: room.basePrice,
        oldElectric: oldE,
        newElectric: newE,
        electricUsage: eUsage,
        electricRate: prop.defaultRates.electricPrice,
        electricTotal: eTotal,
        oldWater: oldW,
        newWater: newW,
        waterUsage: wUsage,
        waterRate: prop.defaultRates.waterPrice,
        waterTotal: wTotal,
        garbageFee: prop.defaultRates.garbageFee,
        internetFee: prop.defaultRates.internetFee,
        parkingFee: util?.parkingFee || prop.defaultRates.parkingMotorbikeFee,
        serviceFee: prop.defaultRates.serviceFee,
        otherFee: 0,
        totalAmount: total,
        paidAmount: 0,
        status: 'UNPAID',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: `${month}-05`,
        transferNote,
        qrUrl: generateVietQRUrl({
          bankCode: prop.bankConfig.bankCode,
          accountNumber: prop.bankConfig.accountNumber,
          accountName: prop.bankConfig.accountName,
          amount: total,
          transferNote,
        }),
      };

      newInvoices.push(inv);
      createdCount++;
    });

    if (newInvoices.length > 0) {
      setInvoices((prev) => [...newInvoices, ...prev]);
    }

    return createdCount;
  };

  const addMaintenanceTicket = (ticketData: Omit<MaintenanceTicket, 'id' | 'reportedAt'>) => {
    const newId = `ticket-${Date.now()}`;
    const newTicket: MaintenanceTicket = {
      ...ticketData,
      id: newId,
      reportedAt: new Date().toISOString(),
    };
    setMaintenanceTickets((prev) => [newTicket, ...prev]);
  };

  const updateMaintenanceStatus = (ticketId: string, status: TicketStatus, cost = 0, resolvedAt?: string) => {
    setMaintenanceTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            status,
            cost: cost > 0 ? cost : t.cost,
            resolvedAt: status === 'RESOLVED' ? (resolvedAt || new Date().toISOString()) : t.resolvedAt,
          };
        }
        return t;
      })
    );

    // If resolved and cost recorded, add an expense transaction
    if (status === 'RESOLVED' && cost > 0) {
      const ticket = maintenanceTickets.find((t) => t.id === ticketId);
      if (ticket && ticket.paidBy === 'OWNER') {
        const newCash: CashTransaction = {
          id: `cash-${Date.now()}`,
          propertyId: ticket.propertyId,
          type: 'EXPENSE',
          category: 'Bảo trì sửa chữa',
          amount: cost,
          date: new Date().toISOString().split('T')[0],
          description: `Chi phí sửa chữa: ${ticket.title} (Phòng ${ticket.roomNumber})`,
          roomId: ticket.roomId,
          roomNumber: ticket.roomNumber,
          receiptNumber: `PC-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
        };
        setCashTransactions((prev) => [newCash, ...prev]);
      }
    }
  };

  const deleteMaintenanceTicket = (ticketId: string) => {
    setMaintenanceTickets((prev) => prev.filter((t) => t.id !== ticketId));
  };

  const addCashTransaction = (transactionData: Omit<CashTransaction, 'id' | 'receiptNumber'>) => {
    const prefix = transactionData.type === 'INCOME' ? 'PT' : 'PC';
    const newTx: CashTransaction = {
      ...transactionData,
      id: `cash-${Date.now()}`,
      receiptNumber: `${prefix}-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
    };
    setCashTransactions((prev) => [newTx, ...prev]);
  };

  const updateCashTransaction = (txId: string, updates: Partial<CashTransaction>) => {
    setCashTransactions((prev) =>
      prev.map((tx) => (tx.id === txId ? { ...tx, ...updates } : tx))
    );
  };

  const deleteCashTransaction = (txId: string) => {
    setCashTransactions((prev) => prev.filter((tx) => tx.id !== txId));
  };

  const resetToDefaultData = () => {
    setProperties(INITIAL_PROPERTIES);
    setRooms(INITIAL_ROOMS);
    setTenants(INITIAL_TENANTS);
    setContracts(INITIAL_CONTRACTS);
    setAssets(INITIAL_ROOM_ASSETS);
    setUtilityReadings(INITIAL_UTILITY_READINGS);
    setInvoices(INITIAL_INVOICES);
    setMaintenanceTickets(INITIAL_MAINTENANCE_TICKETS);
    setCashTransactions(INITIAL_CASH_TRANSACTIONS);
    setSelectedPropertyId(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppContext.Provider
      value={{
        properties,
        rooms,
        tenants,
        contracts,
        assets,
        utilityReadings,
        invoices,
        maintenanceTickets,
        cashTransactions,
        selectedPropertyId,
        setSelectedPropertyId,
        selectedProperty,
        filteredRooms,
        filteredInvoices,
        filteredTenants,
        filteredContracts,
        filteredTickets,
        filteredCashTransactions,
        dashboardStats,
        updateRoomStatus,
        addTenant,
        updateTenant,
        deleteTenant,
        addContract,
        updateContract,
        renewContract,
        terminateContract,
        deleteContract,
        recordUtilityReading,
        saveBatchUtilityReadings,
        markInvoicePaid,
        generateInvoicesForMonth,
        addMaintenanceTicket,
        updateMaintenanceStatus,
        deleteMaintenanceTicket,
        addCashTransaction,
        updateCashTransaction,
        deleteCashTransaction,
        resetToDefaultData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
