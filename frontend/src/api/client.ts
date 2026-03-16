import type {
  Window,
  Purpose,
  CreateTicketRequest,
  CreateWindowRequest,
  CreatePurposeRequest,
  Ticket,
  TicketPreviewResponse,
} from './types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:7121'

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${BASE_URL}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as { message?: string }).message ?? res.statusText)
  }
  return data as T
}

export async function getActiveWindows(): Promise<Window[]> {
  return request<Window[]>('/api/Windows/active')
}

export async function getPurposesByWindow(windowId: string): Promise<Purpose[]> {
  return request<Purpose[]>(`/api/Purposes/window/${windowId}`)
}

export async function createTicket(body: CreateTicketRequest): Promise<Ticket> {
  return request<Ticket>('/api/Tickets', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function getNextTicketsPreview(
  windowId: string
): Promise<TicketPreviewResponse> {
  return request<TicketPreviewResponse>(
    `/api/Tickets/window/${windowId}/preview`
  )
}

// Admin: Windows
export async function getAllWindows(): Promise<Window[]> {
  return request<Window[]>('/api/Windows')
}

export async function getWindow(id: string): Promise<Window> {
  return request<Window>(`/api/Windows/${id}`)
}

export async function createWindow(body: CreateWindowRequest): Promise<Window> {
  return request<Window>('/api/Windows', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function updateWindow(
  id: string,
  body: CreateWindowRequest
): Promise<void> {
  await request<void>(`/api/Windows/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export async function deleteWindow(id: string): Promise<void> {
  await request<void>(`/api/Windows/${id}`, { method: 'DELETE' })
}

// Admin: Purposes
export async function getAllPurposes(): Promise<Purpose[]> {
  return request<Purpose[]>('/api/Purposes')
}

export async function getPurpose(id: string): Promise<Purpose> {
  return request<Purpose>(`/api/Purposes/${id}`)
}

export async function createPurpose(
  body: CreatePurposeRequest
): Promise<Purpose> {
  return request<Purpose>('/api/Purposes', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function updatePurpose(
  id: string,
  body: CreatePurposeRequest
): Promise<void> {
  await request<void>(`/api/Purposes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export async function deletePurpose(id: string): Promise<void> {
  await request<void>(`/api/Purposes/${id}`, { method: 'DELETE' })
}

// Tickets (all, for admin)
export async function getAllTickets(): Promise<Ticket[]> {
  return request<Ticket[]>('/api/Tickets')
}

// Officer: Tickets
export async function getTicketsByWindow(windowId: string): Promise<Ticket[]> {
  return request<Ticket[]>(`/api/Tickets/window/${windowId}`)
}

export async function callNextTicket(
  windowId: string,
  officerId: string
): Promise<Ticket> {
  return request<Ticket>(
    `/api/Tickets/window/${windowId}/call?officerId=${officerId}`,
    { method: 'POST' }
  )
}

export async function completeTicket(ticketId: string): Promise<void> {
  await request<void>(`/api/Tickets/${ticketId}/complete`, { method: 'POST' })
}

export async function markNoShow(ticketId: string): Promise<void> {
  await request<void>(`/api/Tickets/${ticketId}/noshow`, { method: 'POST' })
}

export async function transferTicket(
  ticketId: string,
  targetWindowId: string
): Promise<void> {
  await request<void>(
    `/api/Tickets/${ticketId}/transfer?targetWindowId=${targetWindowId}`,
    { method: 'POST' }
  )
}
