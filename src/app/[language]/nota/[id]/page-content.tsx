"use client";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import useAuth from "@/services/auth/use-auth";
// import { useAuthLoginService } from "@/services/api/services/auth";
// import useAuthActions from "@/services/auth/use-auth-actions";
// import useAuthTokens from "@/services/auth/use-auth-tokens";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { useGetNotaService } from "@/services/api/services/notas";
import { useTranslation } from "@/services/i18n/client";
// import { useSnackbar } from "notistack";
import { useRouter } from "next/navigation";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import { NotaCard } from "@/components/cards/notaCard";
import React, { useEffect, useState } from "react";
import { Nota } from "@/services/api/types/nota";

type Props = {
  params: { [key: string]: string | undefined };
};

type NotaCardProps = Nota;

function List(props: Props) {
  // const { setUser } = useAuthActions();
  // const { setTokensInfo } = useAuthTokens();
  // const fetchAuthLogin = useAuthLoginService();
  // const { enqueueSnackbar } = useSnackbar();
  const { params } = props;
  const router = useRouter();
  const { t } = useTranslation("listing");
  const { user } = useAuth();

  const fetchNotaDetails = useGetNotaService();
  const [isLoading, setIsLoading] = useState(true);
  const [notaDetails, setNotaDetails] = useState<NotaCardProps | null>(null);

  useEffect(() => {
    setIsLoading(true); // Indicate loading state
    if (user) {
      fetchNotaDetails({ id: params.id! })
        .then((data) => {
          if (data.status === HTTP_CODES_ENUM.OK) {
            setNotaDetails(data.data.nota ?? null); // Step 3: Update state with sorted data, defaulting to null if undefined
            setIsLoading(false); // Update loading state
          }
        })
        .catch((err) => {
          console.error(`Failed to fetch client data: ${user.id}`, err);
          setIsLoading(false); // Update loading state
        });
    }
  }, [user, fetchNotaDetails, params.id]); // Include 'fetchListGarantias' in the dependency array

  return (
    <Container maxWidth="sm" className="mainContainer">
      <Grid>
        <Grid>
          <h1>Nota Fiscal</h1>
        </Grid>
        <Grid container spacing={3} rowSpacing={3}>
          {isLoading || !notaDetails ? (
            <p>Loading...</p>
          ) : (
            <Grid item xs={12}>
              <NotaCard
                item={notaDetails}
                onClick={() => {
                  router.replace(`/listing`);
                }}
                action="Voltar"
                type="details"
                t={t}
              />
            </Grid>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}

function Listing(props: Props) {
  return <List params={props.params} />;
}

export default withPageRequiredAuth(Listing);
