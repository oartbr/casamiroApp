"use client";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import useAuth from "@/services/auth/use-auth";
// import { useAuthLoginService } from "@/services/api/services/auth";
// import useAuthActions from "@/services/auth/use-auth-actions";
// import useAuthTokens from "@/services/auth/use-auth-tokens";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { useGetListingNotasByUserService } from "@/services/api/services/notas";
import { useUserGroupsQuery } from "@/services/api/react-query/groups-queries";
import { useTranslation } from "@/services/i18n/client";
import useLanguage from "@/services/i18n/use-language";
// import { useSnackbar } from "notistack";
import { useRouter } from "next/navigation";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
// import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Pagination from "@mui/material/Pagination";
import Divider from "@mui/material/Divider";

import { NotaCard } from "@/components/cards/notaCard";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { Nota } from "@/services/api/types/nota";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar/Avatar";
import { ListingSkeleton } from "@/components/skeletons/ListingSkeleton";
import { SortEnum } from "@/services/api/types/sort-type";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import AddIcon from "@mui/icons-material/Add";

type Props = {
  params: { [key: string]: string | undefined };
};

type ItemCardProps = Nota;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function List(props: Props) {
  // const { setUser } = useAuthActions();
  // const { setTokensInfo } = useAuthTokens();
  // const fetchAuthLogin = useAuthLoginService();
  // const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const { t } = useTranslation("listing");
  const language = useLanguage();
  const { user } = useAuth();

  const fetchListNotas = useGetListingNotasByUserService();
  const { data: groupsData } = useUserGroupsQuery(user?.id?.toString() || "");
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<ItemCardProps[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    user?.activeGroupId || ""
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const previousPageRef = useRef(1);

  const activeGroups = groupsData?.groupsByStatus?.active || [];

  /* const currentActiveGroup = activeGroups.find(
    (membership) => membership.group_id.id === user?.activeGroupId
  ); */

  const handleGroupFilterChange = async (groupId: string) => {
    if (!user?.id) return;

    setSelectedGroupId(groupId);
    setCurrentPage(1);

    // Refresh the notas list to show notas from the selected group
    setIsLoading(true);
    fetchListNotas({
      userId: user.id.toString(),
      page: 1,
      limit: limit,
      filters: { groupId: groupId },
      sort: [{ orderBy: "purchaseDate", order: SortEnum.DESC }],
    })
      .then((data) => {
        if (data.status === HTTP_CODES_ENUM.OK) {
          const sortedItems = (data.data.results as ItemCardProps[]).sort(
            (a: ItemCardProps, b: ItemCardProps) =>
              new Date(b.purchaseDate || b.registeredAt).getTime() -
              new Date(a.purchaseDate || a.registeredAt).getTime()
          );
          setItems(sortedItems);
          setTotalPages(data.data.totalPages || 1);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(`Failed to fetch client data: ${user.id}`, err);
        setIsLoading(false);
      });
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    console.log("handlePageChange called with page:", page);
    console.log("Current page before update:", currentPage);
    setCurrentPage(page);
    // The useEffect will handle fetching the new page data
  };

  useEffect(() => {
    console.log(
      "useEffect triggered - user:",
      user?.id,
      "currentPage:",
      currentPage,
      "selectedGroupId:",
      selectedGroupId
    );
    if (!user?.id) return;

    setIsLoading(true); // Indicate loading state
    console.log("Fetching notas for page:", currentPage);
    fetchListNotas({
      userId: user.id.toString(),
      page: currentPage,
      limit: limit,
      filters: selectedGroupId ? { groupId: selectedGroupId } : undefined,
      sort: [{ orderBy: "purchaseDate", order: SortEnum.DESC }],
    })
      .then((data) => {
        if (data.status === HTTP_CODES_ENUM.OK) {
          const responseData = data.data as {
            results: ItemCardProps[];
            totalPages?: number;
            totalResults?: number;
          };
          console.log(
            "Notas fetched - status:",
            data.status,
            "totalPages:",
            responseData?.totalPages,
            "results count:",
            responseData?.results?.length
          );
          const sortedItems = (responseData.results || []).sort(
            (a: ItemCardProps, b: ItemCardProps) =>
              new Date(b.purchaseDate || b.registeredAt).getTime() -
              new Date(a.purchaseDate || a.registeredAt).getTime()
          );
          setItems(sortedItems); // Step 3: Update state with sorted data
          setTotalPages(responseData.totalPages || 1);
          console.log("Items updated, totalPages:", responseData.totalPages);
        } else {
          console.log("Notas fetch failed with status:", data.status);
        }
        setIsLoading(false); // Update loading state
      })
      .catch((err) => {
        console.error(`Failed to fetch client data: ${user.id}`, err);
        setIsLoading(false); // Update loading state
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, selectedGroupId, currentPage]); // fetchListNotas is stable from useCallback

  // Group items by month
  const groupedByMonth = useMemo(() => {
    const groups: { [key: string]: ItemCardProps[] } = {};

    items.forEach((item) => {
      const date = new Date(item.purchaseDate || item.registeredAt);
      // getMonth() returns 0-11, so we add 1 to get 1-12
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // 1-12
      const monthKey = `${year}-${String(month).padStart(2, "0")}`;

      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(item);
    });

    // Sort months in descending order (most recent first)
    const sortedMonths = Object.keys(groups).sort((a, b) => b.localeCompare(a));

    // Get locale from language (pt -> pt-BR, es -> es-ES, etc.)
    const locale =
      language === "pt" ? "pt-BR" : language === "es" ? "es-ES" : "en-US";

    return sortedMonths.map((monthKey) => {
      // Parse the monthKey (e.g., "2025-11") and create a date for the first day of that month
      // Use local time to avoid timezone issues
      const [year, month] = monthKey.split("-").map(Number);
      const date = new Date(year, month - 1, 1); // month is 1-12, Date constructor expects 0-11
      const monthLabel = date.toLocaleDateString(locale, {
        month: "long",
        year: "numeric",
      });
      return {
        monthKey,
        monthLabel: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
        items: groups[monthKey],
      };
    });
  }, [items, language]);

  // Scroll to top of page when page changes
  useEffect(() => {
    if (previousPageRef.current !== currentPage && items.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }, 100);
      previousPageRef.current = currentPage;
    }
  }, [currentPage, items.length]);

  return (
    <Container maxWidth="lg" className="mainContainer">
      {/* Group Information and Filter */}
      {activeGroups.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <FormControl fullWidth sx={{ mb: 3, mt: 1 }}>
            <InputLabel>{t("selectGroupToView")}</InputLabel>
            <Select
              value={selectedGroupId || ""}
              onChange={(e) => handleGroupFilterChange(e.target.value)}
              label={t("selectGroupToView")}
            >
              {activeGroups.map((group) => (
                <MenuItem key={group.group_id.id} value={group.group_id.id}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar
                      src={group.group_id.iconUrl}
                      variant="square"
                      sx={{
                        mr: 2,
                        bgcolor: group.group_id.iconUrl
                          ? "transparent"
                          : "primary.main",
                        width: 56,
                        height: 56,
                      }}
                    >
                      {!group.group_id.iconUrl &&
                        (group.group_id.name?.[0]?.toUpperCase() || "")}
                    </Avatar>
                    <Box>
                      <Typography variant="body2">
                        {group.group_id.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ({group.role})
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}
      <Grid container spacing={3} rowSpacing={3}>
        {/* Phantom "New Nota" Card */}
        <Grid item xs={12} key="phantom-nota">
          <Card
            sx={{
              cursor: "pointer",
              border: "2px dashed",
              borderColor: "divider",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "action.hover",
              },
              transition: "all 0.1s ease-in-out",
            }}
            onClick={() => router.replace("/scan")}
          >
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 100,
                textAlign: "center",
              }}
            >
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: "transparent",
                  border: "2px dashed",
                  borderColor: "primary.main",
                  mb: 2,
                }}
              >
                <AddIcon sx={{ fontSize: 40, color: "primary.main" }} />
              </Avatar>
              <Typography variant="h6" component="div" sx={{ fontWeight: 100 }}>
                {t("actions.scanNewNota", { defaultValue: "Scan a new nota" })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        {isLoading ? (
          <Grid item xs={12}>
            <ListingSkeleton />
          </Grid>
        ) : groupedByMonth.length > 0 ? (
          <>
            {groupedByMonth.map((monthGroup) => (
              <React.Fragment key={monthGroup.monthKey}>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }}>
                    <Typography variant="h6" color="text.secondary">
                      {monthGroup.monthLabel}
                    </Typography>
                  </Divider>
                </Grid>
                {monthGroup.items.map((item, index) => (
                  <Grid
                    item
                    xs={12}
                    key={`${monthGroup.monthKey}-${item.id}-${index}`}
                  >
                    <NotaCard
                      item={item}
                      onClick={() => {
                        router.replace(`nota/${item.id}`);
                      }}
                      action={t("actions.viewDetails")}
                      type="listing"
                      t={t}
                    />
                  </Grid>
                ))}
              </React.Fragment>
            ))}
            {totalPages > 1 && (
              <Grid item xs={12}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mt: 3,
                    mb: 3,
                  }}
                >
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                  />
                </Box>
              </Grid>
            )}
          </>
        ) : (
          <Grid item xs={12}>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ textAlign: "center", py: 4 }}
            >
              {t("noNotasFound", { defaultValue: "No notas found" })}
            </Typography>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}

function Listing(props: Props) {
  return <List params={props.params} />;
}

export default withPageRequiredAuth(Listing);
