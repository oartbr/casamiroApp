"use client";

import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import MuiLink from "@mui/material/Link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import { useTranslation } from "@/services/i18n/client";
import { Trans } from "react-i18next/TransWithoutContext";
import { StandardLandingPage } from "@/components/landingPage/standard";
import useAuth from "@/services/auth/use-auth";
import { useEffect, useMemo, useState } from "react";
import { useGetListingNotasByUserService } from "@/services/api/services/notas";
import { useRouter } from "next/navigation";
import { hasReturningUserCookie } from "@/services/auth/returning-user-cookie";
import useLanguage from "@/services/i18n/use-language";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import {
  useGetDefaultListByGroupService,
  useGetListItemsService,
} from "@/services/api/services/lists";
import { ListItem } from "@/services/api/types/list";
import { NotaCard } from "@/components/cards/notaCard";
import { Nota } from "@/services/api/types/nota";
import Alert from "@mui/material/Alert/Alert";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { UserTasks } from "@/components/dashboard/user-tasks";

export default function PageContent() {
  const { t } = useTranslation("dashboard");
  const { t: userHome } = useTranslation("returningUser");
  const { t: notaCardT } = useTranslation("listing");
  const { user, isLoaded } = useAuth();
  const router = useRouter();
  const language = useLanguage();

  const fetchListNotas = useGetListingNotasByUserService();
  const getDefaultListByGroup = useGetDefaultListByGroupService();
  const getListItems = useGetListItemsService();

  const [latestNota, setLatestNota] = useState<Nota | null>(null);
  const [defaultListName, setDefaultListName] = useState<string | undefined>(
    undefined
  );
  const [defaultListItems, setDefaultListItems] = useState<ListItem[]>([]);
  const [returningUser, setReturningUser] = useState(false);

  const activeGroupId = useMemo(() => user?.activeGroupId || "", [user]);

  // Check returning user cookie only on client side to avoid hydration mismatch
  useEffect(() => {
    setReturningUser(hasReturningUserCookie());
  }, []);

  // Redirect to sign-in if user is not logged in but has a returning_user cookie
  useEffect(() => {
    if (isLoaded && !user && returningUser) {
      // router.replace(`/${language}/check-phone-number`);
    }
  }, [isLoaded, user, router, language, returningUser]);

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
            new Date(b.purchaseDate as unknown as string).getTime() -
            new Date(a.purchaseDate as unknown as string).getTime()
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

  // Show skeleton while loading or if user not loaded
  if (!isLoaded) {
    return <DashboardSkeleton />;
  }

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
          <Grid item xs={12} md={6}>
            <h1 style={{ margin: 0, textAlign: "left" }}>
              {t(greetingKey, { user: user.firstName })}
            </h1>
            <UserTasks
              latestNota={latestNota}
              defaultListItems={defaultListItems}
              activeGroupId={activeGroupId}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <h1 style={{ marginTop: 0, textAlign: "left", fontSize: "1.5rem" }}>
              {t("defaultList", { group: defaultListName })}
            </h1>
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
                <Alert severity="info">{t("noItemsMessage")}</Alert>
              )}
            </Box>
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 1 }}
              onClick={() => router.replace("/lists")}
            >
              {t("actions.editList", { defaultValue: "Edit list" })}{" "}
              {defaultListName}
            </Button>
          </Grid>
          <Grid item xs={12} md={12}>
            <h1 style={{ marginTop: 0, textAlign: "left", fontSize: "1.5rem" }}>
              {t("lastNota", { group: "Última compra registrada" })}
            </h1>
            <div>
              {latestNota ? ( // show the latest receipt
                <>
                  <NotaCard
                    item={latestNota}
                    onClick={() => {
                      router.replace(`nota/${latestNota.id}`);
                    }}
                    action={t("actions.viewItem")}
                    type="listing"
                    t={notaCardT}
                  />
                </>
              ) : (
                <Box>
                  <Alert severity="info">{t("noNotasFound")}</Alert>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ mt: 1 }}
                    onClick={() => router.replace("/scan")}
                  >
                    {t("actions.scanNota", { defaultValue: "Scan Nota" })}
                  </Button>
                </Box>
              )}
            </div>
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (returningUser) {
    return (
      <Container maxWidth="sm" className="mainContainer">
        <Grid container spacing={3} pt={3} direction="row">
          <Grid item xs={12} md={12}>
            <div className="mensagem">
              <Typography variant="h4" gutterBottom>
                {userHome("title")}
              </Typography>
              <Typography variant="body1" paragraph>
                <Trans
                  i18nKey="description"
                  t={userHome}
                  components={[
                    <MuiLink
                      key="1"
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://xpand.international"
                    >
                      {}
                    </MuiLink>,
                  ]}
                />
              </Typography>
              <Button
                variant="outlined"
                LinkComponent={Link}
                href="/check-phone-number"
                data-testid="login"
                sx={{ mb: 2 }}
              >
                {userHome("callToAction")}
              </Button>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {userHome("socialProof")}
              </Typography>
            </div>
          </Grid>
        </Grid>
      </Container>
    );
  }

  // Otherwise, show the original public home content
  return <StandardLandingPage />;
}
