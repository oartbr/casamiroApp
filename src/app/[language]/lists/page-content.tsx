"use client";

import React, { useState, useEffect } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import { ListsSkeleton } from "@/components/skeletons/ListsSkeleton";
import Skeleton from "@mui/material/Skeleton";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { useUserGroupsQuery } from "@/services/api/react-query/groups-queries";
import { useGetDefaultListByGroupQuery } from "@/services/api/react-query/lists-queries";
import useAuth from "@/services/auth/use-auth";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { RoleEnum } from "@/services/api/types/role";
import ItemInput from "@/components/lists/item-input";
import ItemDisplay from "@/components/lists/item-display";
import { ListItem as ListItemType } from "@/services/api/types/list";
import { useTranslation } from "@/services/i18n/client";
import List from "@mui/material/List/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar/Avatar";

interface ListsPageContentProps {
  params: { [key: string]: string | undefined };
}

function ListsPageContent({}: ListsPageContentProps) {
  const { user } = useAuth();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const { t } = useTranslation("lists");

  // Get user's groups
  const {
    data: userGroupsData,
    isLoading: groupsLoading,
    error: groupsError,
  } = useUserGroupsQuery(user?.id?.toString() || "");

  // Get default list for selected group
  const {
    data: defaultList,
    isLoading: listLoading,
    error: listError,
    refetch: refetchDefaultList, // eslint-disable-line @typescript-eslint/no-unused-vars
  } = useGetDefaultListByGroupQuery(selectedGroupId || "", !!selectedGroupId);

  // Items are now embedded in the list, so we don't need a separate query
  const itemsLoading = false;
  const itemsError = null;
  const refetchItems = () => {
    // Refetch the list to get updated items
    refetchDefaultList();
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const activeGroups = userGroupsData?.groupsByStatus?.active || [];
  const items = defaultList?.items || [];

  // Set first group as selected when groups are loaded
  useEffect(() => {
    if (activeGroups.length > 0 && !selectedGroupId) {
      const firstGroup = activeGroups[0];
      // Groups are already filtered at the service level, so group_id is guaranteed to be valid
      setSelectedGroupId(firstGroup.group_id.id);
    }
  }, [activeGroups, selectedGroupId]);

  const handleItemAdded = () => {
    refetchItems();
  };

  const handleItemDeleted = () => {
    refetchItems();
  };

  const handleItemUpdated = () => {
    refetchItems();
  };

  if (groupsLoading) {
    return <ListsSkeleton />;
  }

  if (groupsError) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 2 }}>
          {t("failedToLoadGroups")}
        </Alert>
      </Container>
    );
  }

  if (activeGroups.length === 0) {
    return (
      <Container maxWidth="lg">
        <Alert severity="info" sx={{ mt: 2 }}>
          {t("noGroupsMessage")}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 2 }}>
        <FormControl fullWidth sx={{ mb: 3, mt: 1 }}>
          <InputLabel>{t("selectGroup")}</InputLabel>
          <Select
            value={selectedGroupId || ""}
            label={t("selectGroup")}
            onChange={(e) => setSelectedGroupId(e.target.value)}
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
                  <Typography variant="body2">{group.group_id.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    ({group.role})
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedGroupId && (
          <>
            {listLoading ? (
              <Box>
                <Skeleton
                  variant="rectangular"
                  height={48}
                  sx={{ mb: 2, borderRadius: 1 }}
                />
                <List>
                  {[1, 2, 3, 4].map((i) => (
                    <ListItem key={i}>
                      <ListItemText
                        primary={<Skeleton variant="text" width="60%" />}
                        secondary={<Skeleton variant="text" width="40%" />}
                      />
                      <Skeleton variant="circular" width={40} height={40} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            ) : listError ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {t("failedToLoadList")}
              </Alert>
            ) : defaultList ? (
              <>
                <ItemInput
                  listId={defaultList.id}
                  onItemAdded={handleItemAdded}
                  placeholder={t("addItemPlaceholder")}
                  helperText={t("addItemHelperText")}
                />

                {itemsLoading ? (
                  <List>
                    {[1, 2, 3, 4].map((i) => (
                      <ListItem key={i}>
                        <ListItemText
                          primary={<Skeleton variant="text" width="60%" />}
                          secondary={<Skeleton variant="text" width="40%" />}
                        />
                        <Skeleton variant="circular" width={40} height={40} />
                      </ListItem>
                    ))}
                  </List>
                ) : itemsError ? (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {t("failedToLoadItems")}
                  </Alert>
                ) : items.length === 0 ? (
                  <Alert severity="info">{t("noItemsMessage")}</Alert>
                ) : (
                  <List>
                    {items.map((item: ListItemType) => (
                      <ItemDisplay
                        key={item.id}
                        item={item}
                        listId={defaultList.id}
                        onItemDeleted={handleItemDeleted}
                        onItemUpdated={handleItemUpdated}
                        deleteAction={t("actions.deleteItem")}
                        markAsCompleteAction={t("actions.markAsComplete")}
                        markAsIncompleteAction={t("actions.markAsIncomplete")}
                      />
                    ))}
                  </List>
                )}
              </>
            ) : (
              <Alert severity="error">{t("noDefaultListFound")}</Alert>
            )}
          </>
        )}
      </Box>
    </Container>
  );
}

export default withPageRequiredAuth(ListsPageContent, {
  roles: [RoleEnum.ADMIN, RoleEnum.USER],
});
