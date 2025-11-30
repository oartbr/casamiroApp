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
import Link from "@mui/material/Link";
import { Nota } from "@/services/api/types/nota";

function checkScannedData(url: string, checkQRcode: (id: string) => void) {
  const aUrl = url.split("/");
  if (aUrl[2] === "www.sefaz.rs.gov.br" || aUrl[2] === "localhost:3000") {
    checkQRcode(url);
  }
}

function Scan() {
  const { t } = useTranslation("scan");
  const [oNota, setNotaStatus] = useState<Nota | null>(null);
  const checkNota = useCheckNotaService();

  const router = useRouter();
  const { user } = useAuth();

  const checkQRcode = async (notaUrl: string) => {
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
          console.log({ nota: response.data.nota });
          router.push(`listing`);
        }
      }
    } catch (error) {
      console.error("Error fetching garantia:", error);
    }
  };

  return (
    <Container maxWidth="md">
      <Grid container spacing={3} wrap="nowrap" pt={3}>
        <Grid item xs={12} style={{ width: "100%" }}>
          <QRscanner callBack={(url) => checkScannedData(url, checkQRcode)} />
        </Grid>
      </Grid>
      <Grid container spacing={3} wrap="nowrap" pt={3}>
        {oNota?.url && oNota.url === "" && (
          <Grid item className="scanScreenButton">
            <Button
              variant="contained"
              LinkComponent={Link}
              href="/"
              data-testid="scan-qr"
            >
              {t("cancel")}
            </Button>
          </Grid>
        )}
        {oNota?.url && oNota.url !== "" && (
          <Grid item className="scanScreenSuccess">
            <Typography variant="h1" component="h1">
              {"✅"}
            </Typography>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}

export default Scan;
