"use client";
import { useState, useRef } from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Image from "next/image";
import { useTranslation } from "@/services/i18n/client";
import QRscanner from "@/components/QRscanner/QRscanner";
import {
  useCheckNotaService,
  CheckNotaRequest,
} from "@/services/api/services/notas";
import useAuth from "@/services/auth/use-auth";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { useSnackbar } from "notistack";
import type { OnboardingStatusResponse } from "@/services/api/services/onboarding";

type Props = {
  onComplete: () => void;
  onboardingData: OnboardingStatusResponse;
};

export default function Step5Nota({ onComplete }: Props) {
  const { t } = useTranslation("onboarding");
  const { t: scanT } = useTranslation("scan");
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const checkNota = useCheckNotaService();
  const [showScanner, setShowScanner] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const isProcessingRef = useRef(false);

  const handleScanClick = () => {
    setShowScanner(true);
  };

  const handleScanQRCode = async (notaUrl: string) => {
    // Prevent multiple simultaneous scans
    if (isProcessingRef.current) {
      console.log("Scan already in progress, ignoring duplicate scan");
      return;
    }

    try {
      isProcessingRef.current = true;

      // Validate URL format
      if (!notaUrl || typeof notaUrl !== "string") {
        enqueueSnackbar(scanT("error.invalidQRCode"), { variant: "error" });
        return;
      }

      const aUrl = notaUrl.split("/");
      const hostname = aUrl[2] || "";

      // Check if it's a valid SEFAZ URL
      if (
        hostname === "www.sefaz.rs.gov.br" ||
        hostname === "localhost:3000" ||
        hostname.includes("sefaz.rs.gov.br")
      ) {
        const requestData: CheckNotaRequest = {
          notaUrl,
          userId: user?.id,
        };

        const response = await checkNota(requestData);

        console.log("Check nota response:", response);
        console.log("Response status:", response.status);
        console.log("Response data:", response.data);

        if (response.status === HTTP_CODES_ENUM.OK || response.status === 201) {
          // Check if nota was successfully processed
          // The wrapper puts the JSON response in response.data
          // So if API returns { nota: {...} }, then response.data = { nota: {...} }
          const nota = response.data?.nota;

          console.log("Nota check:", {
            hasData: !!response.data,
            hasNota: !!nota,
            dataType: typeof response.data,
            dataKeys: response.data ? Object.keys(response.data) : [],
            nota,
          });

          if (nota) {
            console.log("Nota successfully processed:", nota);
            setScanSuccess(true);
            setShowScanner(false);
            enqueueSnackbar(scanT("success.message"), { variant: "success" });
          } else {
            // Response OK but no nota data - might be already processed or invalid
            console.warn("Response OK but no nota data found:", {
              response,
              data: response.data,
              hasData: !!response.data,
              dataKeys: response.data ? Object.keys(response.data) : [],
            });
            enqueueSnackbar(scanT("error.invalidQRCode"), { variant: "error" });
          }
        } else {
          console.error("Check nota response error:", response);
          enqueueSnackbar(scanT("error.invalidQRCode"), {
            variant: "error",
          });
        }
      } else {
        enqueueSnackbar(scanT("error.invalidQRCode"), { variant: "error" });
      }
    } catch (error) {
      console.error("Error checking nota:", error);
      enqueueSnackbar(scanT("error.invalidQRCode"), { variant: "error" });
    } finally {
      isProcessingRef.current = false;
    }
  };

  if (showScanner) {
    return (
      <Box>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ mb: 3, fontWeight: "100" }}
        >
          {t("step6.title")}
        </Typography>

        <Typography
          variant="body1"
          sx={{ mb: 4, color: "text.secondary", fontWeight: "100" }}
        >
          {t("step6.subtitle")}
        </Typography>

        <Box
          sx={{
            position: "relative",
            width: "100%",
            mb: 3,
            borderRadius: 2,
            overflow: "hidden",
            minHeight: 400,
          }}
        >
          <QRscanner callBack={handleScanQRCode} />
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => setShowScanner(false)}
            fullWidth
          >
            {t("step6.cancelScan")}
          </Button>
        </Box>
      </Box>
    );
  }

  if (scanSuccess) {
    return (
      <Box>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ mb: 3, fontWeight: "100" }}
        >
          {t("step6.titleScanned")}
        </Typography>

        <Typography
          variant="body1"
          sx={{ mb: 4, color: "text.secondary", fontWeight: "100" }}
        >
          {t("step6.successMessageScanned")}
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Button
            variant="contained"
            size="large"
            onClick={onComplete}
            fullWidth
          >
            {t("step6.continue")}
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ mb: 3, fontWeight: "100" }}
      >
        {t("step6.title")}
      </Typography>

      <Typography
        variant="body1"
        sx={{ mb: 3, color: "text.secondary", fontWeight: "100" }}
      >
        {t("step6.subtitle")}
      </Typography>

      <Box
        sx={{
          mb: 4,
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Image
          src="/onboarding/scanning.jpg"
          alt={t("step6.scanningImageAlt")}
          width={600}
          height={400}
          style={{
            width: "100%",
            height: "auto",
            borderRadius: 8,
            objectFit: "contain",
          }}
        />
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleScanClick}
          fullWidth
        >
          {t("step6.scanNow")}
        </Button>

        <Button variant="text" size="medium" onClick={onComplete}>
          {t("step6.doLater")}
        </Button>
      </Box>
    </Box>
  );
}
