import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAllTickets,
  getTicketsByWindow,
  getNextTicketsPreview,
  createTicket,
  callNextTicket,
  completeTicket,
  markNoShow,
  transferTicket,
} from '../client'
import type { CreateTicketRequest } from '../types'

export function useTickets() {
  return useQuery({
    queryKey: ['tickets'],
    queryFn: getAllTickets,
    refetchInterval: 3000,
  })
}

export function useTicketsByWindow(windowId: string) {
  return useQuery({
    queryKey: ['tickets', 'window', windowId],
    queryFn: () => getTicketsByWindow(windowId),
    enabled: !!windowId,
    refetchInterval: 3000,
  })
}

export function useTicketPreview(windowId: string) {
  return useQuery({
    queryKey: ['tickets', 'preview', windowId],
    queryFn: () => getNextTicketsPreview(windowId),
    enabled: !!windowId,
    refetchInterval: 3000,
  })
}

export function useCreateTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateTicketRequest) => createTicket(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
  })
}

export function useCallNextTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ windowId, officerId }: { windowId: string; officerId: string }) =>
      callNextTicket(windowId, officerId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      queryClient.invalidateQueries({ queryKey: ['tickets', 'window', variables.windowId] })
      queryClient.invalidateQueries({ queryKey: ['tickets', 'preview', variables.windowId] })
    },
  })
}

export function useCompleteTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ticketId: string) => completeTicket(ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
  })
}

export function useNoShowTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ticketId: string) => markNoShow(ticketId),
    onSuccess: () => {
      // Invalidate all ticket-related queries so both DisplayPage and OfficerPage update
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
  })
}

export function useTransferTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ ticketId, targetWindowId }: { ticketId: string; targetWindowId: string }) =>
      transferTicket(ticketId, targetWindowId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
  })
}
