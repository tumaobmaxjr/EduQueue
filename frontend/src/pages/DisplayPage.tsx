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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  const nextUp = useMemo(() => {
    return tickets
      .filter((t) => t.status === 0 || t.status === 4)
      .sort((a, b) => {
        if (a.isPriority !== b.isPriority) return a.isPriority ? -1 : 1;
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

  // Queue for selected window: all queued + no-show tickets sorted by priority then time
  const selectedWindowQueue = useMemo(() => {
    if (!selectedWindowId) return [];
    return tickets
      .filter(
        (t) =>
          t.windowId === selectedWindowId && (t.status === 0 || t.status === 4),
      )
      .sort((a, b) => {
        if (a.isPriority !== b.isPriority) return a.isPriority ? -1 : 1;
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
   Queue List Component
   ───────────────────────────────────────────────────────── */

function QueueList({ queue, theme }: { queue: Ticket[]; theme: Theme }) {
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
        sx={{ flexShrink: 0 }}
      >
        Queue
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 2, flexShrink: 0 }}
      >
        {queue.length > 0
          ? `${queue.length} ticket${queue.length !== 1 ? "s" : ""} total`
          : "No tickets in queue"}
      </Typography>

      {queue.length > 0 ? (
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ flex: 1, overflow: "auto" }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{ fontWeight: 700, bgcolor: "background.paper" }}
                >
                  #
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 700, bgcolor: "background.paper" }}
                >
                  Ticket
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 700, bgcolor: "background.paper" }}
                >
                  Name
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    display: { xs: "none", sm: "table-cell" },
                    bgcolor: "background.paper",
                  }}
                >
                  Purpose
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 700, bgcolor: "background.paper" }}
                >
                  Priority
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    display: { xs: "none", md: "table-cell" },
                    bgcolor: "background.paper",
                  }}
                >
                  Joined
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {queue.map((t, index) => (
                <TableRow
                  key={t.id}
                  sx={{
                    bgcolor:
                      t.status === 4
                        ? alpha(theme.palette.warning.main, 0.08)
                        : t.isPriority
                          ? alpha(theme.palette.error.main, 0.04)
                          : "transparent",
                    "&:last-child td": { borderBottom: 0 },
                  }}
                >
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color="text.secondary"
                    >
                      {index + 1}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body1"
                      fontWeight={700}
                      fontFamily="monospace"
                      color={t.isPriority ? "error.main" : "primary.main"}
                    >
                      {t.ticketNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {maskClientName(t.clientName)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                    <Typography variant="body2" color="text.secondary">
                      {t.purposeName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack
                      direction="row"
                      spacing={0.5}
                      flexWrap="wrap"
                      useFlexGap
                    >
                      {t.isPriority && (
                        <Chip
                          label="Priority"
                          color="error"
                          size="small"
                          sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                        />
                      )}
                      {t.status === 4 && (
                        <Chip
                          label="No-Show"
                          color="warning"
                          size="small"
                          sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                        />
                      )}
                      {!t.isPriority && t.status !== 4 && (
                        <Typography variant="body2" color="text.disabled">
                          Regular
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(t.createdAt).toLocaleTimeString()}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper
          variant="outlined"
          sx={{
            p: 4,
            textAlign: "center",
            bgcolor: alpha(theme.palette.grey[500], 0.02),
          }}
        >
          <Typography variant="body1" color="text.secondary">
            The queue is empty. New tickets will appear here.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
