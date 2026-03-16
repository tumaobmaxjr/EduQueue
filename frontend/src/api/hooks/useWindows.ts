import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAllWindows,
  getActiveWindows,
  getWindow,
  createWindow,
  updateWindow,
  deleteWindow,
} from '../client'
import type { CreateWindowRequest } from '../types'

export function useWindows() {
  return useQuery({
    queryKey: ['windows'],
    queryFn: getAllWindows,
  })
}

export function useActiveWindows() {
  return useQuery({
    queryKey: ['windows', 'active'],
    queryFn: getActiveWindows,
  })
}

export function useWindow(id: string) {
  return useQuery({
    queryKey: ['windows', id],
    queryFn: () => getWindow(id),
    enabled: !!id,
  })
}

export function useCreateWindow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateWindowRequest) => createWindow(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['windows'] })
    },
  })
}

export function useUpdateWindow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: CreateWindowRequest }) =>
      updateWindow(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['windows'] })
    },
  })
}

export function useDeleteWindow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteWindow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['windows'] })
    },
  })
}
