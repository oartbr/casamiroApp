"use client";

import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import MuiLink from "@mui/material/Link";
import Image from "next/image";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import { useTranslation } from "@/services/i18n/client";
import { Trans } from "react-i18next/TransWithoutContext";
import tanque from "../../../public/assets/images/nf.png";
import scan from "../../../public/assets/images/home.png";
import useAuth from "@/services/auth/use-auth";
import { useEffect, useMemo, useState } from "react";
import { useGetListingNotasByUserService } from "@/services/api/services/notas";
import { useRouter } from "next/navigation";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import {
  useGetDefaultListByGroupService,
  useGetListItemsService,
} from "@/services/api/services/lists";
import { ListItem } from "@/services/api/types/list";
import { NotaCard } from "@/components/cards/notaCard";
import { Nota } from "@/services/api/types/nota";

export default function PageContent() {
  const { t } = useTranslation("dashboard");
  const { t: tHome } = useTranslation("home");
  const { user, isLoaded } = useAuth();
  const router = useRouter();

  const fetchListNotas = useGetListingNotasByUserService();
  const getDefaultListByGroup = useGetDefaultListByGroupService();
  const getListItems = useGetListItemsService();

  const [latestNota, setLatestNota] = useState<Nota | null>(null);
  const [defaultListName, setDefaultListName] = useState<string | undefined>(
    undefined
  );
  const [defaultListItems, setDefaultListItems] = useState<ListItem[]>([]);

  const activeGroupId = useMemo(() => user?.activeGroupId || "", [user]);

  // Determine greeting based on current time
  const greetingKey = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 12) {
      return "greetings.morning";
    } else if (hour >= 12 && hour < 18) {
      return "greetings.afternoon";
    } else {
      return "greetings.night";
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    // Fetch latest nota filtered by default group
    fetchListNotas({
      userId: String(user.id),
      page: 1,
      limit: 10,
      filters: activeGroupId ? { groupId: activeGroupId } : undefined,
    }).then((data) => {
      if (data.status === HTTP_CODES_ENUM.OK) {
        const results = (data.data.results as Nota[]) || [];
        results.sort(
          (a, b) =>
            new Date(a.purchaseDate as unknown as string).getTime() -
            new Date(b.purchaseDate as unknown as string).getTime()
        );
        setLatestNota(results[0] || null);
      }
    });

    // Fetch default list for active group and its items
    if (activeGroupId) {
      getDefaultListByGroup(activeGroupId).then((listResponse) => {
        // The listResponse is expected to be of type FetchJsonResponse<List>
        // Check for status and data accordingly
        if (listResponse.status === HTTP_CODES_ENUM.OK && listResponse.data) {
          const name = listResponse.data.groupId?.name;
          const listId = listResponse.data.id;
          setDefaultListName(name);
          getListItems(listId).then((itemsResponse) => {
            if (
              itemsResponse.status === HTTP_CODES_ENUM.OK &&
              itemsResponse.data
            ) {
              const items = itemsResponse.data.results || [];
              console.log({ items });
              const pendingItems = items.filter((item) => !item.isCompleted);
              setDefaultListItems(pendingItems);
            } else {
              setDefaultListItems([]);
            }
          });
        } else {
          setDefaultListName(undefined);
          setDefaultListItems([]);
        }
      });
    } else {
      setDefaultListName(undefined);
      setDefaultListItems([]);
    }
  }, [
    user,
    activeGroupId,
    fetchListNotas,
    getDefaultListByGroup,
    getListItems,
  ]);

  // If logged in, show dashboard
  if (isLoaded && user) {
    return (
      <Container maxWidth="sm" className="mainContainer">
        <Grid
          container
          spacing={3}
          pt={3}
          direction="column"
          sx={{ minHeight: "60vh", alignItems: "start" }}
        >
          <h1>{t(greetingKey, { user: user.firstName })}</h1>
          <Grid item xs={12} md={6}>
            <div className="mensagem">
              {latestNota ? ( // show the latest receipt
                <>
                  <NotaCard
                    item={latestNota}
                    onClick={() => {
                      router.replace(`nota/${latestNota.id}`);
                    }}
                    action={t("actions.viewItem")}
                    type="listing"
                  />
                </>
              ) : (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {t("dashboard.noNotas", { defaultValue: "No notas found" })}
                </Typography>
              )}
            </div>
          </Grid>

          <Grid item xs={12} md={6}>
            <h1>{t("defaultList", { group: defaultListName })}</h1>
            <Box component="div" sx={{ position: "relative" }}>
              {defaultListItems?.length ? (
                <ul>
                  {defaultListItems.map((it) => (
                    <li key={it.id}>
                      <Typography variant="body2">{it.text}</Typography>
                    </li>
                  ))}
                </ul>
              ) : (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {t("dashboard.noListItems", {
                    defaultValue: "No items in your default list",
                  })}
                </Typography>
              )}
            </Box>
            <Button onClick={() => router.replace("/lists")}>
              {t("actions.editList", { defaultValue: "Edit List" })}
            </Button>
          </Grid>
        </Grid>
      </Container>
    );
  }

  // Otherwise, show the original public home content
  return (
    <Container maxWidth="lg">
      <Grid
        container
        spacing={3}
        pt={3}
        direction="row"
        sx={{ minHeight: "90vh", alignItems: "center" }}
      >
        <Grid item xs={12} md={6}>
          <div className="mensagem">
            <Typography variant="h4" gutterBottom>
              {tHome("title")}
            </Typography>
            <Typography variant="body1" paragraph>
              <Trans
                i18nKey="description"
                t={tHome}
                components={[
                  <MuiLink
                    key="1"
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://github.com/brocoders/extensive-react-boilerplate/blob/main/docs/README.md"
                  >
                    {}
                  </MuiLink>,
                ]}
              />
            </Typography>
            <Button
              variant="contained"
              LinkComponent={Link}
              href="/sign-up"
              data-testid="sign-up"
              className="joinButton"
              sx={{ mb: 2 }}
            >
              {tHome("callToAction")}
            </Button>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {tHome("socialProof")}
            </Typography>
          </div>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box
            component="div"
            className="scan"
            sx={{ position: "relative", height: "400px" }}
          >
            <div className="scanning">
              <Image
                className="qrTanque"
                src={tanque.src}
                alt="tanque"
                fill={true}
                style={{ objectFit: "contain" }}
              />
              <Image
                className="qrScan"
                src={scan.src}
                alt="scan"
                fill={true}
                style={{ objectFit: "contain" }}
              />
            </div>
          </Box>
        </Grid>
        <Grid item xs={12} sx={{ textAlign: "center", mt: "auto" }}>
          <MuiLink href="/privacy-policy">{t("privacy-policy")}</MuiLink>
        </Grid>
      </Grid>
    </Container>
  );
}
