"use client";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import useAuth from "@/services/auth/use-auth";
// import { useAuthLoginService } from "@/services/api/services/auth";
// import useAuthActions from "@/services/auth/use-auth-actions";
// import useAuthTokens from "@/services/auth/use-auth-tokens";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { useGetListingNotasByUserService } from "@/services/api/services/notas";
import { useUserGroupsQuery } from "@/services/api/react-query/groups-queries";
// import { useTranslation } from "@/services/i18n/client";
// import { useSnackbar } from "notistack";
import { useRouter } from "next/navigation";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import { NotaCard } from "@/components/cards/notaCard";
import React, { useEffect, useState } from "react";
import { Nota } from "@/services/api/types/nota";

type Props = {
  params: { [key: string]: string | undefined };
};

type ItemCardProps = Nota;

function List(props: Props) {
  // const { setUser } = useAuthActions();
  // const { setTokensInfo } = useAuthTokens();
  // const fetchAuthLogin = useAuthLoginService();
  // const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  console.log(props);
  // const { t } = useTranslation("register");
  const { user } = useAuth();

  const fetchListNotas = useGetListingNotasByUserService();
  const { data: groupsData } = useUserGroupsQuery(user?.id?.toString() || "");
  const [isLoading, setIsLoading] = useState({});
  const [items, setItems] = useState<ItemCardProps[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    user?.activeGroupId || ""
  );

  const activeGroups = groupsData?.groupsByStatus?.active || [];
  const currentActiveGroup = activeGroups.find(
    (membership) => membership.group_id.id === user?.activeGroupId
  );

  const handleGroupFilterChange = async (groupId: string) => {
    if (!user?.id) return;

    setSelectedGroupId(groupId);

    // Refresh the notas list to show notas from the selected group
    setIsLoading(true);
    fetchListNotas({
      userId: user.id.toString(),
      page: 1,
      limit: 10,
      filters: { groupId: groupId },
    })
      .then((data) => {
        if (data.status === HTTP_CODES_ENUM.OK) {
          const sortedItems = (data.data.results as ItemCardProps[]).sort(
            (a: ItemCardProps, b: ItemCardProps) =>
              new Date(b.registeredAt).getTime() -
              new Date(a.registeredAt).getTime()
          );
          setItems(sortedItems);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(`Failed to fetch client data: ${user.id}`, err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    setIsLoading(true); // Indicate loading state
    if (user) {
      fetchListNotas({
        userId: user.id.toString(),
        page: 1,
        limit: 10,
        filters: { groupId: selectedGroupId },
      })
        .then((data) => {
          if (data.status === HTTP_CODES_ENUM.OK) {
            const sortedItems = (data.data.results as ItemCardProps[]).sort(
              (a: ItemCardProps, b: ItemCardProps) =>
                new Date(b.registeredAt).getTime() -
                new Date(a.registeredAt).getTime()
            );
            setItems(sortedItems); // Step 3: Update state with sorted data
            setIsLoading(false); // Update loading state
          }
        })
        .catch((err) => {
          console.error(`Failed to fetch client data: ${user.id}`, err);
          setIsLoading(false); // Update loading state
        });
    }
  }, [user, fetchListNotas, selectedGroupId]); // Include selectedGroupId in dependencies

  return (
    <Container maxWidth="sm" className="mainContainer">
      <Grid>
        <Grid>
          <h1>Notas Fiscais</h1>

          {/* Group Information and Filter */}
          {activeGroups.length > 0 && (
            <Box
              sx={{
                mb: 3,
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
              }}
            >
              <Typography variant="h6" gutterBottom>
                Current Active Group
              </Typography>
              {currentActiveGroup ? (
                <Box display="flex" alignItems="center" mb={2}>
                  <Chip
                    label={currentActiveGroup.group_id.name}
                    color="primary"
                    variant="outlined"
                    sx={{ mr: 2 }}
                  />
                  <Chip
                    label={currentActiveGroup.role}
                    size="small"
                    color={
                      currentActiveGroup.role === "admin"
                        ? "error"
                        : currentActiveGroup.role === "editor"
                          ? "warning"
                          : "default"
                    }
                  />
                </Box>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  No active group selected
                </Typography>
              )}

              <Typography variant="body2" sx={{ mb: 1 }}>
                Filter Notas by Group:
              </Typography>
              <FormControl fullWidth size="small">
                <InputLabel>Select Group to View</InputLabel>
                <Select
                  value={selectedGroupId || ""}
                  onChange={(e) => handleGroupFilterChange(e.target.value)}
                  label="Select Group to View"
                >
                  {activeGroups.map((membership) => (
                    <MenuItem
                      key={membership.group_id.id}
                      value={membership.group_id.id}
                    >
                      {membership.group_id.name} ({membership.role})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </Grid>
        <Grid container spacing={3} rowSpacing={3}>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            items.map((item, index) => (
              <Grid item xs={12} key={index}>
                <NotaCard
                  item={item}
                  onClick={() => {
                    router.replace(`nota/${item.id}`);
                  }}
                  action="Ver detalles"
                  type="listing"
                />
              </Grid>
            ))
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
