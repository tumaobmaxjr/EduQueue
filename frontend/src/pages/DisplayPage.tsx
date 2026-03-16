import {
  Box,
  Typography,
  Grid,
  Paper,
  Stack,
  Chip,
  alpha,
  useTheme,
  Container,
  Button,
} from "@mui/material";
import type { Theme } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useWindows, useTickets } from "../api/hooks";
import type { Ticket, Window as WindowType } from "../api/types";
import { useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

function maskClientName(name: string): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0] + "***";
  return parts[0][0] + ". " + parts[parts.length - 1][0] + "***";
}

export function DisplayPage() {
  const theme = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedWindowId = searchParams.get("window");

  const { data: windows = [] } = useWindows();
  const { data: tickets = [], refetch: refetchTickets } = useTickets();

  // Auto-refresh tickets every 3 seconds for display
  useEffect(() => {
    const interval = setInterval(() => {
      refetchTickets();
    }, 3000);
    return () => clearInterval(interval);
  }, [refetchTickets]);

  // Hide cursor after inactivity (for kiosk mode)
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const hide = () => {
      document.body.style.cursor = "none";
    };
    const show = () => {
      document.body.style.cursor = "default";
      clearTimeout(timeout);
      timeout = setTimeout(hide, 5000);
    };
    document.addEventListener("mousemove", show);
    timeout = setTimeout(hide, 5000);
    return () => {
      clearTimeout(timeout);
      document.removeEventListener("mousemove", show);
      document.body.style.cursor = "default";
    };
  }, []);

  // Build a map: windowId -> currently serving ticket
  const servingByWindow = useMemo(() => {
    const map: Record<string, Ticket | null> = {};
    windows.forEach((w) => {
      map[w.id] = null;
    });
    tickets.forEach((t) => {
      if (t.status === 2 || t.status === 1) {
        const existing = map[t.windowId];
        if (
          !existing ||
          new Date(t.calledAt ?? t.createdAt).getTime() >
            new Date(existing.calledAt ?? existing.createdAt).getTime()
        ) {
          map[t.windowId] = t;
        }
      }
    });
    return map;
  }, [windows, tickets]);

  // Next up tickets across all windows (queued + no-show for re-calling)
  // Order: Queued first, then No-Show; within each group: priority first, then oldest
  const nextUp = useMemo(() => {
    return tickets
      .filter((t) => t.status === 0 || t.status === 4)
      .sort((a, b) => {
        // No-Show (status 4) goes to bottom
        const statusOrderA = a.status === 4 ? 1 : 0;
        const statusOrderB = b.status === 4 ? 1 : 0;
        if (statusOrderA !== statusOrderB) return statusOrderA - statusOrderB;

        // Priority first within same status group
        if (a.isPriority !== b.isPriority) return a.isPriority ? -1 : 1;

        // Oldest first
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
  }, [tickets]);

  const activeWindows = windows.filter((w) => w.isActive);

  // Find the selected window object
  const selectedWindow = selectedWindowId
    ? windows.find((w) => w.id === selectedWindowId)
    : null;

  // Queue for selected window: all queued + no-show tickets
  // Order: Queued first, then No-Show; within each group: priority first, then oldest
  const selectedWindowQueue = useMemo(() => {
    if (!selectedWindowId) return [];
    return tickets
      .filter(
        (t) =>
          t.windowId === selectedWindowId && (t.status === 0 || t.status === 4),
      )
      .sort((a, b) => {
        // No-Show (status 4) goes to bottom
        const statusOrderA = a.status === 4 ? 1 : 0;
        const statusOrderB = b.status === 4 ? 1 : 0;
        if (statusOrderA !== statusOrderB) return statusOrderA - statusOrderB;

        // Priority first within same status group
        if (a.isPriority !== b.isPriority) return a.isPriority ? -1 : 1;

        // Oldest first
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
  }, [tickets, selectedWindowId]);

  const handleWindowClick = (windowId: string) => {
    setSearchParams({ window: windowId });
  };

  const handleBackToAll = () => {
    setSearchParams({});
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        bgcolor: "background.default",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "white",
          py: { xs: 2, sm: 3 },
          px: 2,
          flexShrink: 0,
        }}
      >
        <Container maxWidth="xl">
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h4"
                fontWeight={800}
                gutterBottom
                sx={{ mb: 0.5 }}
              >
                Queue Display
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {selectedWindow
                  ? `${selectedWindow.name} — Detailed Queue View`
                  : "Visayas State University - Real-time Queue Status"}
              </Typography>
            </Box>
            <Box textAlign="right">
              <Typography variant="h4" fontWeight={700} fontFamily="monospace">
                {new Date().toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* Main Content Area */}
      <Container
        maxWidth="xl"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          py: 2,
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        {selectedWindow && (
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBackToAll}
            sx={{ mb: 2, fontWeight: 600, alignSelf: "flex-start" }}
          >
            Back to All Windows
          </Button>
        )}

        <Grid
          container
          spacing={3}
          sx={{ flex: 1, overflow: "hidden", minHeight: 0 }}
        >
          {/* LEFT SIDE: Now Serving */}
          <Grid
            size={{ xs: 12, md: selectedWindow ? 5 : 6 }}
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              minHeight: 0,
            }}
          >
            <Typography
              variant="h5"
              fontWeight={700}
              gutterBottom
              color="text.primary"
              sx={{ flexShrink: 0 }}
            >
              {selectedWindow ? "Window Details" : "Now Serving"}
            </Typography>

            <Box sx={{ flex: 1, overflowY: "auto", pr: 1, pb: 1 }}>
              {selectedWindow ? (
                <NowServingCard
                  window={selectedWindow}
                  servingTicket={servingByWindow[selectedWindow.id] ?? null}
                  queueCount={selectedWindowQueue.length}
                  isLarge={true}
                  theme={theme}
                />
              ) : activeWindows.length > 0 ? (
                <Grid container spacing={2}>
                  {activeWindows.map((w) => {
                    const serving = servingByWindow[w.id] ?? null;
                    const queueCount = tickets.filter(
                      (t) =>
                        t.windowId === w.id &&
                        (t.status === 0 || t.status === 4),
                    ).length;
                    return (
                      <Grid key={w.id} size={{ xs: 12, sm: 6, lg: 6 }}>
                        <NowServingCard
                          window={w}
                          servingTicket={serving}
                          queueCount={queueCount}
                          onClick={() => handleWindowClick(w.id)}
                          isLarge={false}
                          theme={theme}
                        />
                      </Grid>
                    );
                  })}
                </Grid>
              ) : (
                <Paper
                  sx={{
                    p: 6,
                    textAlign: "center",
                    bgcolor: alpha(theme.palette.grey[500], 0.02),
                  }}
                >
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Active Windows
                  </Typography>
                  <Typography variant="body2" color="text.disabled">
                    All service windows are currently offline.
                  </Typography>
                </Paper>
              )}
            </Box>
          </Grid>

          {/* RIGHT SIDE: Waiting Queue */}
          <Grid
            size={{ xs: 12, md: selectedWindow ? 7 : 6 }}
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              minHeight: 0,
            }}
          >
            <QueueList
              queue={selectedWindow ? selectedWindowQueue : nextUp}
              theme={theme}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

/* ─────────────────────────────────────────────────────────
   Now Serving Card Component
   ───────────────────────────────────────────────────────── */

function NowServingCard({
  window,
  servingTicket,
  queueCount,
  onClick,
  isLarge = false,
  theme,
}: {
  window: WindowType;
  servingTicket: Ticket | null;
  queueCount: number;
  onClick?: () => void;
  isLarge?: boolean;
  theme: Theme;
}) {
  const isActive = !!servingTicket;

  return (
    <Paper
      variant="outlined"
      onClick={onClick}
      sx={{
        p: 0,
        overflow: "hidden",
        height: "100%",
        cursor: onClick ? "pointer" : "default",
        bgcolor: isActive
          ? alpha(theme.palette.success.main, 0.02)
          : "background.paper",
        borderColor: isActive ? theme.palette.success.main : "divider",
        borderWidth: isActive ? 2 : 1,
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s ease",
        ...(onClick && {
          "&:hover": {
            boxShadow: theme.shadows[6],
            transform: "translateY(-2px)",
            borderColor: theme.palette.primary.main,
          },
        }),
      }}
    >
      {/* Window Header */}
      <Box
        sx={{
          px: isLarge ? 4 : 2,
          py: isLarge ? 3 : 1.5,
          bgcolor: isActive
            ? alpha(theme.palette.success.main, 0.08)
            : alpha(theme.palette.grey[500], 0.04),
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box>
            <Typography
              variant={isLarge ? "h4" : "h6"}
              fontWeight={800}
              gutterBottom={isLarge}
            >
              {window.name}
            </Typography>
            {window.location && (
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                {isLarge ? `Location: ${window.location}` : window.location}
              </Typography>
            )}
            {isLarge && window.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {window.description}
              </Typography>
            )}
          </Box>
          <Stack
            direction={isLarge ? "row" : "column"}
            spacing={1}
            alignItems="flex-end"
          >
            <Chip
              label={isActive ? "Active" : "Idle"}
              size={isLarge ? "medium" : "small"}
              color={isActive ? "success" : "default"}
              sx={{ fontWeight: 600 }}
            />
            {queueCount > 0 && (
              <Chip
                label={`${queueCount} in queue`}
                size={isLarge ? "medium" : "small"}
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            )}
          </Stack>
        </Stack>
      </Box>

      {/* Ticket Content */}
      <Box
        sx={{
          p: isLarge ? 5 : 3,
          textAlign: "center",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          minHeight: isLarge ? 300 : 150,
        }}
      >
        {isActive ? (
          <Box>
            <Typography
              variant={isLarge ? "h1" : "h3"}
              fontWeight={800}
              fontFamily="monospace"
              letterSpacing={isLarge ? 4 : 2}
              color={servingTicket.isPriority ? "error.main" : "success.main"}
              gutterBottom
              sx={isLarge ? { fontSize: { xs: "3rem", sm: "5rem" } } : {}}
            >
              {servingTicket.ticketNumber}
            </Typography>
            <Typography
              variant={isLarge ? "h5" : "subtitle1"}
              fontWeight={600}
              color="text.primary"
              gutterBottom
            >
              {maskClientName(servingTicket.clientName ?? "")}
            </Typography>
            <Typography
              variant={isLarge ? "h6" : "body2"}
              color="text.secondary"
              gutterBottom
            >
              {servingTicket.purposeName}
            </Typography>
            {servingTicket.isPriority && (
              <Chip
                label="PRIORITY"
                size={isLarge ? "medium" : "small"}
                color="error"
                sx={{ mt: isLarge ? 2 : 1, fontWeight: 700 }}
              />
            )}
          </Box>
        ) : (
          <Box sx={{ py: 3 }}>
            <Typography
              variant="h2"
              sx={{
                color: theme.palette.grey[300],
                fontWeight: 300,
                fontSize: isLarge ? "5rem" : "3rem",
              }}
            >
              --
            </Typography>
            <Typography
              variant={isLarge ? "h6" : "body2"}
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              Waiting for next...
            </Typography>
          </Box>
        )}
      </Box>

      {/* Click hint footer (only on small cards) */}
      {!isLarge && onClick && (
        <Box
          sx={{
            px: 2,
            py: 1,
            bgcolor: alpha(theme.palette.primary.main, 0.04),
            borderTop: "1px solid",
            borderColor: "divider",
            textAlign: "center",
          }}
        >
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={0.5}
          >
            <OpenInNewIcon sx={{ fontSize: 14, color: "text.disabled" }} />
            <Typography variant="caption" color="text.disabled">
              View full queue
            </Typography>
          </Stack>
        </Box>
      )}
    </Paper>
  );
}

/* ─────────────────────────────────────────────────────────
   Queue List Component - Two Column Layout (Priority | Regular)
   ───────────────────────────────────────────────────────── */

function QueueList({ queue, theme }: { queue: Ticket[]; theme: Theme }) {
  // Separate into Priority and Regular (including their No-Shows)
  // Priority Lane: Priority Queued + Priority No-Show
  // Regular Lane: Regular Queued + Regular No-Show
  const priorityQueue = queue
    .filter((t) => t.isPriority && (t.status === 0 || t.status === 4))
    .sort((a, b) => {
      // Queued first, then No-Show
      if (a.status !== b.status) return a.status === 0 ? -1 : 1;
      // Then by creation time
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

  const regularQueue = queue
    .filter((t) => !t.isPriority && (t.status === 0 || t.status === 4))
    .sort((a, b) => {
      // Queued first, then No-Show
      if (a.status !== b.status) return a.status === 0 ? -1 : 1;
      // Then by creation time
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        minHeight: 0,
      }}
    >
      <Typography
        variant="h5"
        fontWeight={700}
        color="text.primary"
        sx={{ flexShrink: 0, mb: 2 }}
      >
        Waiting Queue
      </Typography>

      <Grid container spacing={2} sx={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
        {/* Priority Queue Column */}
        <Grid size={{ xs: 12, md: 6 }} sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
          <QueueColumn
            title="Priority Lane"
            subtitle="PWD, Senior Citizens, Pregnant"
            queue={priorityQueue}
            theme={theme}
            isPriority={true}
          />
        </Grid>

        {/* Regular Queue Column */}
        <Grid size={{ xs: 12, md: 6 }} sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
          <QueueColumn
            title="Regular Lane"
            subtitle="General queue"
            queue={regularQueue}
            theme={theme}
            isPriority={false}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

/* ─────────────────────────────────────────────────────────
   Queue Column Component - Compact view (# and Ticket only)
   ───────────────────────────────────────────────────────── */

function QueueColumn({
  title,
  subtitle,
  queue,
  theme,
  isPriority,
}: {
  title: string;
  subtitle: string;
  queue: Ticket[];
  theme: Theme;
  isPriority: boolean;
}) {
  const accentColor = isPriority ? theme.palette.error.main : theme.palette.primary.main;
  const queuedCount = queue.filter((t) => t.status === 0).length;
  const noShowCount = queue.filter((t) => t.status === 4).length;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      {/* Column Header */}
      <Paper
        variant="outlined"
        sx={{
          px: 2,
          py: 1.5,
          mb: 1,
          bgcolor: alpha(accentColor, 0.08),
          borderColor: alpha(accentColor, 0.3),
          flexShrink: 0,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" fontWeight={700} color={accentColor}>
              {title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.5}>
            <Chip
              label={`${queuedCount} waiting`}
              size="small"
              sx={{
                bgcolor: accentColor,
                color: "white",
                fontWeight: 600,
              }}
            />
            {noShowCount > 0 && (
              <Chip
                label={`${noShowCount} no-show`}
                size="small"
                color="warning"
                sx={{ fontWeight: 600 }}
              />
            )}
          </Stack>
        </Stack>
      </Paper>

      {/* Queue List - Compact */}
      {queue.length > 0 ? (
        <Paper
          variant="outlined"
          sx={{ flex: 1, overflow: "auto" }}
        >
          <Stack>
            {queue.map((t, index) => (
              <Box
                key={t.id}
                sx={{
                  px: 2,
                  py: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom: index < queue.length - 1 ? "1px solid" : "none",
                  borderColor: "divider",
                  bgcolor: t.status === 4
                    ? alpha(theme.palette.warning.main, 0.08)
                    : index === 0
                      ? alpha(accentColor, 0.06)
                      : "transparent",
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  {/* Position number */}
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1,
                      bgcolor: t.status === 4
                        ? "warning.main"
                        : index === 0
                          ? accentColor
                          : "grey.200",
                      color: t.status === 4 || index === 0 ? "white" : "text.secondary",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                    }}
                  >
                    {index + 1}
                  </Box>
                  {/* Ticket number */}
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    fontFamily="monospace"
                    color={t.status === 4 ? "warning.dark" : accentColor}
                  >
                    {t.ticketNumber}
                  </Typography>
                </Stack>
                {/* No-Show badge */}
                {t.status === 4 && (
                  <Chip
                    label="No-Show"
                    size="small"
                    color="warning"
                    sx={{ fontWeight: 600 }}
                  />
                )}
              </Box>
            ))}
          </Stack>
        </Paper>
      ) : (
        <Paper
          variant="outlined"
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: alpha(theme.palette.grey[500], 0.02),
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No {isPriority ? "priority" : "regular"} tickets waiting
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
