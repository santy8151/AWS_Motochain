import { create } from 'zustand'

export const useAppStore = create((set) => ({
  currentPage: 'ai-chat',
  chatUnlocked: false,
  otpVerified: false,
  scannerConnected: false,
  selectedVehicle: null,
  diagnosticBrief: null,
  nodes: [],
  diagnostics: [],
  
  setCurrentPage: (page) => set({ currentPage: page }),
  
  unlockChat: () => set({ chatUnlocked: true }),
  setOtpVerified: (status) => set({ otpVerified: status }),
  
  connectScanner: () => set({ scannerConnected: true }),
  
  disconnectScanner: () => set({ scannerConnected: false }),
  
  setSelectedVehicle: (vehicle) => set({ selectedVehicle: vehicle }),

  setDiagnosticBrief: (brief) => set({ diagnosticBrief: brief }),
  
  setNodes: (nodes) => set({ nodes }),
  
  setDiagnostics: (diagnostics) => set({ diagnostics })
}))
