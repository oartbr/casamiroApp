"use client";
import { useTranslation } from "@/services/i18n/client";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import QRscanner from "@/components/QRscanner/QRscanner";
//import { useEffect } from "react";
// import { Garantia } from "@/services/api/types/garantia";
import {
  useCheckNotaService,
  CheckNotaRequest,
} from "@/services/api/services/notas";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/services/auth/use-auth";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import Button from "@mui/material/Button";
import { Nota } from "@/services/api/types/nota";
import { NotaCard } from "@/components/cards/notaCard";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { useSnackbar } from "notistack";

function Scan() {
  const { t } = useTranslation("scan");
  const [oNota, setNotaStatus] = useState<Nota | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const checkNota = useCheckNotaService();
  const { enqueueSnackbar } = useSnackbar();

  const router = useRouter();
  const { user } = useAuth();

  const checkQRcode = async (notaUrl: string) => {
    // enqueueSnackbar({ message: notaUrl, variant: "info" });
    try {
      const requestData: CheckNotaRequest = {
        notaUrl,
        userId: user?.id, // Add null check for user object
      };
      const response = await checkNota(requestData);

      if (response.status === HTTP_CODES_ENUM.OK) {
        router.push(`./check-phone-number`);
      }
      /*
      // Handle status codes here
      // https://miro.com/app/board/uXjVKoN4LQA=/
      // 1. is the user logged in?
      if (!user) {
        // Is not logged in, handle unauthorized logic here
        router.push(`./${garantiaId}/check-phone-number`);
      } else if (status === HTTP_CODES_ENUM.OK) {
        // 2. is the owner?
        // yes, go to garantia page
        router.push(`./${garantiaId}`);
      } else if (user?.role?.name === "ADMIN") {
        // 3. is the user role admin?
        // yes, chose what to do next, depending on the garantia status
        switch (garantia.status) {
          case "assigned":
            // Add your logic for non-active garantia
            router.push(`./${garantiaId}/ship`);
            break;
          case "shipped":
            // Add your logic for pending garantia
            router.push(`./${garantiaId}/deliver`);
            break;
          case "delivered":
            // Add your logic for expired garantia
            router.push(`./${garantiaId}/sold`);
            break;
          default:
            router.push(`./${garantiaId}/register`);
        }
      } else {
        router.push(`./${garantiaId}/register`);
      }*/
      if (response.data && "nota" in response.data) {
        if (response.data.nota) {
          setNotaStatus(response.data.nota);
          setShowSuccess(true);
          console.log({ nota: response.data.nota });
        }
      }
    } catch (error) {
      console.error("Error fetching garantia:", error);
    }
  };

  const useScanData = (url: string) => {
    const aUrl = url.split("/");
    if (aUrl[2] === "www.sefaz.rs.gov.br" || aUrl[2] === "localhost:3000") {
      checkQRcode(url);
    } else {
      enqueueSnackbar({ message: t("error.invalidQRCode"), variant: "error" });
    }
    return;
  };

  const handleScanAnother = () => {
    setShowSuccess(false);
    setNotaStatus(null);
  };

  const handleContinueToListing = () => {
    router.push(`listing`);
  };

  const handleCancel = () => {
    router.push(`listing`);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ position: "relative", width: "100%" }}>
        <Grid container spacing={3} wrap="nowrap" pt={3}>
          <Grid item xs={12} style={{ width: "100%" }}>
            <QRscanner callBack={useScanData} />
          </Grid>
        </Grid>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3, mb: 3 }}>
          <Button variant="outlined" onClick={handleCancel} size="large">
            {t("cancel", { defaultValue: "Cancel" })}
          </Button>
        </Box>

        {/* Modal overlay when scan is successful */}
        <Dialog
          open={showSuccess}
          onClose={handleScanAnother}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              p: 2,
            },
          }}
        >
          <DialogContent>
            <Typography variant="h5" component="h2" gutterBottom>
              {t("success.title")}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {t("success.message")}
            </Typography>
            {oNota && (
              <Box sx={{ mb: 3 }}>
                <NotaCard
                  item={oNota}
                  onClick={() => {
                    router.replace(`nota/${oNota.id}`);
                  }}
                  action={t("success.viewDetails")}
                  type="listing"
                  t={t}
                />
              </Box>
            )}
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
              <Button
                variant="outlined"
                onClick={handleScanAnother}
                size="large"
              >
                {t("success.scanAnother")}
              </Button>
              <Button
                variant="contained"
                onClick={handleContinueToListing}
                size="large"
              >
                {t("success.continueToListing")}
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </Container>
  );
}

export default Scan;
