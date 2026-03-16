import { useState, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Stack,
  Fade,
  Paper,
  alpha,
  useTheme,
  useMediaQuery,
  MobileStepper,
  Snackbar,
  Alert,
  Chip,
  Grid,
} from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import type { Window, Purpose, Ticket } from "../api/types";
import { useActiveWindows, useTickets } from "../api/hooks";
import { usePurposesByWindow, useCreateTicket } from "../api/hooks";
import { TicketSuccessView } from "../components/kiosk";
import { WindowSelector } from "../components/kiosk/WindowSelector";
import { PurposeSelector } from "../components/kiosk/PurposeSelector";
import {
  ClientForm,
  type ClientFormData,
} from "../components/kiosk/ClientForm";
import { ReviewStep } from "../components/kiosk/ReviewStep";

const steps = ["Select Window", "Select Purpose", "Your Info", "Review"];

export function KioskPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // State for ticket creation flow
  const [showTicketFlow, setShowTicketFlow] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedWindow, setSelectedWindow] = useState<Window | null>(null);
  const [selectedPurpose, setSelectedPurpose] = useState<Purpose | null>(null);
  const [formData, setFormData] = useState<ClientFormData>({
    clientName: "",
    studentId: "",
    yearLevel: "",
    isPriority: false,
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "info" | "warning" | "error";
  }>({ open: false, message: "", severity: "info" });

  // Data fetching
  const { data: windows = [], isLoading: loadingWindows } = useActiveWindows();
  const { data: tickets = [] } = useTickets();
  const { data: purposes = [], isLoading: loadingPurposes } =
    usePurposesByWindow(selectedWindow?.id ?? "");
  const createTicketMutation = useCreateTicket();

  // Calculate queue statistics - removed estimated wait time
  const queueStats = useMemo(() => {
    if (!selectedWindow || !selectedPurpose) return null;

    const windowTickets = tickets.filter(
      (t) =>
        t.windowId === selectedWindow.id &&
        t.purposeId === selectedPurpose.id &&
        t.status === 0, // Queued
    );

    const priorityCount = windowTickets.filter((t) => t.isPriority).length;
    const regularCount = windowTickets.filter((t) => !t.isPriority).length;
    const totalQueue = windowTickets.length;

    return {
      total: totalQueue,
      priority: priorityCount,
      regular: regularCount,
    };
  }, [selectedWindow, selectedPurpose, tickets]);

  const showSnackbar = (
    message: string,
    severity: "success" | "info" | "warning" | "error" = "info",
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setError(null);
    if (activeStep === 0) {
      // Going back to main page from first step
      setShowTicketFlow(false);
      setActiveStep(0);
      setSelectedWindow(null);
      setSelectedPurpose(null);
    } else if (activeStep === 2) {
      // Going back from form to purpose
      setActiveStep(1);
    } else if (activeStep === 1) {
      setSelectedPurpose(null);
      setActiveStep(0);
    } else {
      setActiveStep((prev) => prev - 1);
    }
  };

  const handleWindowSelect = (w: Window) => {
    setSelectedWindow(w);
    setSelectedPurpose(null);
    setActiveStep(1);
    showSnackbar(`Window selected: ${w.name}`, "success");
  };

  const handlePurposeSelect = (p: Purpose) => {
    setSelectedPurpose(p);
    setActiveStep(2);
    showSnackbar(`Purpose selected: ${p.name}`, "success");
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0:
        return !!selectedWindow;
      case 1:
        return !!selectedPurpose;
      case 2:
        return isFormValid;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!selectedWindow || !selectedPurpose || !formData.clientName.trim())
      return;
    setError(null);

    try {
      const body = {
        windowId: selectedWindow.id,
        purposeId: selectedPurpose.id,
        isPriority: formData.isPriority,
        clientName: formData.clientName.trim(),
        ...(formData.studentId &&
          formData.studentId.trim() && {
            studentId: formData.studentId.trim(),
          }),
        ...(formData.yearLevel &&
          formData.yearLevel.trim() && {
            yearLevel: formData.yearLevel.trim(),
          }),
      };
      const created = await createTicketMutation.mutateAsync(body);
      setTicket(created);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create ticket");
    }
  };

  const handleReset = () => {
    setTicket(null);
    setShowTicketFlow(false);
    setActiveStep(0);
    setSelectedWindow(null);
    setSelectedPurpose(null);
    setFormData({
      clientName: "",
      studentId: "",
      yearLevel: "",
      isPriority: false,
    });
    setError(null);
  };

  const handleGetTicket = () => {
    setShowTicketFlow(true);
    setActiveStep(0);
  };

  if (ticket) {
    return <TicketSuccessView ticket={ticket} onGetAnother={handleReset} />;
  }

  // Show ticket creation flow
  if (showTicketFlow) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.default",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            bgcolor: "primary.main",
            color: "white",
            py: { xs: 2, sm: 3 },
            px: 2,
            textAlign: "center",
            flexShrink: 0,
          }}
        >
          <Container maxWidth="md">
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 1.5,
                bgcolor: alpha("#fff", 0.15),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 1.5,
              }}
            >
              <ConfirmationNumberIcon sx={{ fontSize: 28 }} />
            </Box>
            <Typography variant={isMobile ? "h5" : "h4"} fontWeight={800}>
              Get Queue Ticket
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
              Follow the steps to get your queue ticket
            </Typography>
          </Container>
        </Box>

        <Container
          maxWidth="md"
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            py: { xs: 2, sm: 3 },
            overflow: "hidden",
            minHeight: 0,
          }}
        >
          {/* Stepper */}
          <Box sx={{ flexShrink: 0 }}>
            {!isMobile ? (
              <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            ) : (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                  fontWeight={600}
                >
                  Step {activeStep + 1} of {steps.length}: {steps[activeStep]}
                </Typography>
                <MobileStepper
                  variant="progress"
                  steps={steps.length}
                  position="static"
                  activeStep={activeStep}
                  sx={{
                    bgcolor: "transparent",
                    p: 0,
                    mt: 1,
                    "& .MuiLinearProgress-root": {
                      width: "100%",
                      borderRadius: 4,
                      height: 6,
                    },
                  }}
                  nextButton={<Box />}
                  backButton={<Box />}
                />
              </Box>
            )}

            {/* Error */}
            {error && (
              <Paper
                sx={{
                  p: 2,
                  mb: 3,
                  bgcolor: alpha(theme.palette.error.main, 0.05),
                  borderColor: "error.light",
                }}
              >
                <Typography variant="body2" color="error.main" fontWeight={500}>
                  {error}
                </Typography>
              </Paper>
            )}
          </Box>

          {/* Step Content */}
          <Box sx={{ flex: 1, overflowY: "auto", px: 1 }}>
            <Fade in key={activeStep} timeout={300}>
              <Box>
                {activeStep === 0 && (
                  <WindowSelector
                    windows={windows}
                    loading={loadingWindows}
                    selectedId={selectedWindow?.id ?? null}
                    onSelect={handleWindowSelect}
                  />
                )}
                {activeStep === 1 && (
                  <PurposeSelector
                    purposes={purposes}
                    loading={loadingPurposes}
                    selectedId={selectedPurpose?.id ?? null}
                    onSelect={handlePurposeSelect}
                    windowName={selectedWindow?.name ?? ""}
                  />
                )}
                {activeStep === 2 && (
                  <>
                    {/* Queue Info Banner */}
                    {queueStats && (
                      <Paper
                        sx={{
                          p: 3,
                          mb: 3,
                          bgcolor: alpha(theme.palette.info.main, 0.05),
                          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          color="info.main"
                          fontWeight={600}
                          gutterBottom
                        >
                          Current Queue Status for {selectedPurpose?.name}
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 6 }}>
                            <Typography variant="h6" fontWeight={700}>
                              {queueStats.total}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              People in Queue
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 6 }}>
                            <Stack direction="row" spacing={1}>
                              {queueStats.priority > 0 && (
                                <Chip
                                  label={`${queueStats.priority} Priority`}
                                  size="small"
                                  color="warning"
                                  variant="outlined"
                                />
                              )}
                              {queueStats.regular > 0 && (
                                <Chip
                                  label={`${queueStats.regular} Regular`}
                                  size="small"
                                  color="default"
                                  variant="outlined"
                                />
                              )}
                            </Stack>
                          </Grid>
                        </Grid>
                      </Paper>
                    )}
                    <ClientForm
                      formData={formData}
                      onChange={setFormData}
                      onValidationChange={setIsFormValid}
                    />
                  </>
                )}
                {activeStep === 3 && (
                  <>
                    {/* Queue Info Banner */}
                    {queueStats && (
                      <Paper
                        sx={{
                          p: 2,
                          mb: 3,
                          bgcolor: alpha(theme.palette.success.main, 0.05),
                          border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="success.main"
                          fontWeight={600}
                          textAlign="center"
                        >
                          You'll be #{queueStats.total + 1} in queue
                        </Typography>
                      </Paper>
                    )}
                    <ReviewStep
                      window={selectedWindow}
                      purpose={selectedPurpose}
                      formData={formData}
                    />
                  </>
                )}
              </Box>
            </Fade>
          </Box>

          {/* Navigation */}
          {activeStep < steps.length && (
            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{ pt: 3, flexShrink: 0 }}
            >
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={createTicketMutation.isPending}
                startIcon={<NavigateBeforeIcon />}
                size="large"
                sx={{ minWidth: 140 }}
              >
                {activeStep === 0 ? "Back to Home" : "Back"}
              </Button>
              {activeStep > 1 && (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!canProceed() || createTicketMutation.isPending}
                  endIcon={
                    activeStep < steps.length - 1 ? (
                      <NavigateNextIcon />
                    ) : undefined
                  }
                  startIcon={
                    activeStep === steps.length - 1 ? (
                      <ConfirmationNumberIcon />
                    ) : undefined
                  }
                  size="large"
                  sx={{ minWidth: 160 }}
                >
                  {activeStep === steps.length - 1
                    ? createTicketMutation.isPending
                      ? "Getting Ticket..."
                      : "Get Ticket"
                    : "Continue"}
                </Button>
              )}
            </Stack>
          )}
        </Container>

        {/* Snackbar Notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  // Main landing page - Simple and clean
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "white",
          py: { xs: 4, sm: 6 },
          px: 2,
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 2,
              bgcolor: alpha("#fff", 0.15),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
            }}
          >
            <ConfirmationNumberIcon sx={{ fontSize: 36 }} />
          </Box>
          <Typography
            variant={isMobile ? "h4" : "h3"}
            fontWeight={800}
            gutterBottom
          >
            EduQueue Kiosk
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
            Visayas State University
          </Typography>
          <Typography
            variant="body1"
            sx={{ opacity: 0.8, maxWidth: 500, mx: "auto" }}
          >
            Get your queue ticket quickly and easily. Select your service window
            and get in line digitally.
          </Typography>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="sm" sx={{ py: { xs: 6, sm: 8 } }}>
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h5"
            fontWeight={700}
            gutterBottom
            color="text.primary"
          >
            Ready to get your ticket?
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 400, mx: "auto" }}
          >
            Click the button below to start the process. You'll select your
            service window and provide your information.
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={handleGetTicket}
            startIcon={<ConfirmationNumberIcon />}
            sx={{
              py: 2,
              px: 4,
              fontSize: "1.1rem",
              fontWeight: 600,
              borderRadius: 2,
              textTransform: "none",
              boxShadow: 3,
              "&:hover": {
                boxShadow: 6,
              },
            }}
          >
            Get Queue Ticket
          </Button>

          <Typography
            variant="caption"
            display="block"
            color="text.disabled"
            sx={{ mt: 3 }}
          >
            The process takes about 2 minutes to complete
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
