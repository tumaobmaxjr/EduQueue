import { Box, Skeleton, Stack } from '@mui/material'

interface LoadingSkeletonProps {
  variant?: 'cards' | 'list' | 'form' | 'stats'
  count?: number
}

function StatsSkeleton() {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} variant="rounded" height={100} sx={{ borderRadius: 1.5 }} />
      ))}
    </Box>
  )
}

function CardsSkeleton({ count = 3 }: { count: number }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} variant="rounded" height={140} sx={{ borderRadius: 1.5 }} />
      ))}
    </Box>
  )
}

function ListSkeleton({ count = 5 }: { count: number }) {
  return (
    <Stack spacing={1.5}>
      {Array.from({ length: count }, (_, i) => (
        <Stack key={i} direction="row" spacing={2} alignItems="center">
          <Skeleton variant="rounded" width={60} height={32} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={22} />
            <Skeleton variant="text" width="40%" height={18} />
          </Box>
          <Skeleton variant="rounded" width={80} height={28} />
        </Stack>
      ))}
    </Stack>
  )
}

function FormSkeleton() {
  return (
    <Stack spacing={2.5}>
      <Skeleton variant="rounded" height={56} sx={{ borderRadius: 1 }} />
      <Skeleton variant="rounded" height={56} sx={{ borderRadius: 1 }} />
      <Skeleton variant="rounded" height={100} sx={{ borderRadius: 1 }} />
      <Skeleton variant="rounded" height={48} width={120} sx={{ borderRadius: 1 }} />
    </Stack>
  )
}

export function LoadingSkeleton({ variant = 'cards', count = 3 }: LoadingSkeletonProps) {
  switch (variant) {
    case 'stats':
      return <StatsSkeleton />
    case 'cards':
      return <CardsSkeleton count={count} />
    case 'list':
      return <ListSkeleton count={count} />
    case 'form':
      return <FormSkeleton />
    default:
      return <CardsSkeleton count={count} />
  }
}
