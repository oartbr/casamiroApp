"use client";

import React, { useState, useEffect } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
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

interface ListsPageContentProps {
  params: { [key: string]: string | undefined };
}

function ListsPageContent({}: ListsPageContentProps) {
  const { user } = useAuth();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

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

  // Set first group as selected when groups are loaded
  useEffect(() => {
    if (
      userGroupsData?.groupsByStatus?.active &&
      userGroupsData.groupsByStatus.active.length > 0 &&
      !selectedGroupId
    ) {
      const firstGroup = userGroupsData.groupsByStatus.active[0];
      setSelectedGroupId(firstGroup.group_id.id);
    }
  }, [userGroupsData, selectedGroupId]);

  const activeGroups = userGroupsData?.groupsByStatus?.active || [];
  const items = defaultList?.items || [];

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
    return (
      <Container maxWidth="lg">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight={200}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (groupsError) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 2 }}>
          Failed to load groups. Please try again.
        </Alert>
      </Container>
    );
  }

  if (activeGroups.length === 0) {
    return (
      <Container maxWidth="lg">
        <Alert severity="info" sx={{ mt: 2 }}>
          You are not a member of any groups yet. Join a group to start using
          lists.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 2 }}>
        <Typography variant="h3" gutterBottom>
          Lists
        </Typography>

        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Select Group</InputLabel>
            <Select
              value={selectedGroupId || ""}
              label="Select Group"
              onChange={(e) => setSelectedGroupId(e.target.value)}
            >
              {activeGroups.map((group) => (
                <MenuItem key={group.group_id.id} value={group.group_id.id}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2">
                      {group.group_id.name}
                    </Typography>
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
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : listError ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  Failed to load list. Please try again.
                </Alert>
              ) : defaultList ? (
                <>
                  <Typography variant="h5" gutterBottom>
                    {defaultList.name}
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{ ml: 1, color: "text.secondary" }}
                    >
                      (Default List)
                    </Typography>
                  </Typography>

                  {defaultList.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {defaultList.description}
                    </Typography>
                  )}

                  <ItemInput
                    listId={defaultList.id}
                    onItemAdded={handleItemAdded}
                  />

                  {itemsLoading ? (
                    <Box display="flex" justifyContent="center" py={4}>
                      <CircularProgress />
                    </Box>
                  ) : itemsError ? (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      Failed to load items. Please try again.
                    </Alert>
                  ) : items.length === 0 ? (
                    <Alert severity="info">
                      No items in this list yet. Add your first item above!
                    </Alert>
                  ) : (
                    <Box>
                      {items.map((item: ListItemType) => (
                        <ItemDisplay
                          key={item.id}
                          item={item}
                          listId={defaultList.id}
                          onItemDeleted={handleItemDeleted}
                          onItemUpdated={handleItemUpdated}
                        />
                      ))}
                    </Box>
                  )}
                </>
              ) : (
                <Alert severity="error">
                  No default list found for this group.
                </Alert>
              )}
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
}

export default withPageRequiredAuth(ListsPageContent, {
  roles: [RoleEnum.ADMIN, RoleEnum.USER],
});
