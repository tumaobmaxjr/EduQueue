import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAllPurposes,
  getPurposesByWindow,
  getPurpose,
  createPurpose,
  updatePurpose,
  deletePurpose,
} from '../client'
import type { CreatePurposeRequest } from '../types'

export function usePurposes() {
  return useQuery({
    queryKey: ['purposes'],
    queryFn: getAllPurposes,
  })
}

export function usePurposesByWindow(windowId: string) {
  return useQuery({
    queryKey: ['purposes', 'window', windowId],
    queryFn: () => getPurposesByWindow(windowId),
    enabled: !!windowId,
  })
}

export function usePurpose(id: string) {
  return useQuery({
    queryKey: ['purposes', id],
    queryFn: () => getPurpose(id),
    enabled: !!id,
  })
}

export function useCreatePurpose() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreatePurposeRequest) => createPurpose(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purposes'] })
    },
  })
}

export function useUpdatePurpose() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: CreatePurposeRequest }) =>
      updatePurpose(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purposes'] })
    },
  })
}

export function useDeletePurpose() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deletePurpose(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purposes'] })
    },
  })
}
