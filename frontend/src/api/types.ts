// Mirror backend DTOs

export interface CreateWindowRequest {
  name: string
  description: string
  code: string
  location?: string
}

export interface CreatePurposeRequest {
  name: string
  description: string
  windowId: string
}

export interface Window {
  id: string
  name: string
  description: string
  code: string | null
  location: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string | null
  ticketCount: number
}

export interface Purpose {
  id: string
  name: string
  description: string
  windowId: string
  windowName: string
  isActive: boolean
  createdAt: string
  updatedAt: string | null
  ticketCount: number
}

export interface CreateTicketRequest {
  windowId: string
  purposeId: string
  isPriority: boolean
  clientName: string
  clientEmail?: string
  studentId?: string
  course?: string
  yearLevel?: string
  department?: string
}

export interface Ticket {
  id: string
  ticketNumber: string
  windowId: string
  windowName: string
  purposeId: string
  purposeName: string
  isPriority: boolean
  status: number
  clientName: string
  clientEmail: string | null
  studentId: string | null
  course: string | null
  yearLevel: string | null
  department: string | null
  createdAt: string
  calledAt: string | null
  completedAt: string | null
  queuePosition: number
}

export interface TicketPreviewItem {
  position: number
  ticketNumber: string
  isPriority: boolean
}

export interface TicketPreviewResponse {
  currentPosition: number
  totalQueueLength: number
  nextTickets: TicketPreviewItem[]
}
