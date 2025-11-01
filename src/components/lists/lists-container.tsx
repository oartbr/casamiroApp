"use client";

import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import {
  useGetListsByGroupQuery,
  useGetDefaultListByGroupQuery,
} from "../../services/api/react-query/lists-queries";
import { useGetListItemsQuery } from "../../services/api/react-query/lists-queries";
import ListSelector from "./list-selector";
import ItemInput from "./item-input";
import ItemDisplay from "./item-display";
import { ListItem as ListItemType } from "../../services/api/types/list";

interface ListsContainerProps {
  groupId: string;
}

export default function ListsContainer({ groupId }: ListsContainerProps) {
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  // Get lists for the group
  const {
    data: listsData,
    isLoading: listsLoading,
    error: listsError,
  } = useGetListsByGroupQuery(groupId as unknown as string);

  // Get default list
  const { data: defaultList, isLoading: defaultListLoading } =
    useGetDefaultListByGroupQuery(groupId as unknown as string);

  // Get items for selected list
  const {
    data: itemsData,
    isLoading: itemsLoading,
    error: itemsError,
    refetch: refetchItems,
  } = useGetListItemsQuery(selectedListId || "", !!selectedListId);

  // Set default list when lists are loaded
  useEffect(() => {
    if (defaultList && !selectedListId) {
      setSelectedListId(defaultList.id);
    }
  }, [defaultList, selectedListId]);

  // Reset to default list when group changes
  useEffect(() => {
    if (defaultList) {
      setSelectedListId(defaultList.id);
    }
  }, [groupId, defaultList]);

  const lists = listsData?.results || [];
  const items = itemsData?.results || [];
  const selectedList = lists.find((list) => list.id === selectedListId);

  const handleListChange = (listId: string | null) => {
    setSelectedListId(listId);
  };

  const handleItemAdded = () => {
    refetchItems();
  };

  const handleItemDeleted = () => {
    refetchItems();
  };

  const handleItemUpdated = () => {
    refetchItems();
  };

  if (listsLoading || defaultListLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={200}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (listsError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Failed to load lists. Please try again.
      </Alert>
    );
  }

  if (lists.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No lists found for this group. Create your first list to get started.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Lists
      </Typography>
      <ListSelector
        lists={lists}
        selectedListId={selectedListId}
        onListChange={handleListChange}
        groupId={groupId}
      />

      {selectedList && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            {selectedList.name}
            {selectedList.isDefault && (
              <Typography
                component="span"
                variant="caption"
                sx={{ ml: 1, color: "text.secondary" }}
              >
                (Default)
              </Typography>
            )}
          </Typography>

          {selectedList.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {selectedList.description}
            </Typography>
          )}

          <ItemInput listId={selectedList.id} onItemAdded={handleItemAdded} />

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
            <List className="itemLista">
              {items.map((item: ListItemType) => (
                <ItemDisplay
                  key={item.id}
                  item={item}
                  listId={selectedList.id}
                  onItemDeleted={handleItemDeleted}
                  onItemUpdated={handleItemUpdated}
                />
              ))}
            </List>
          )}
        </>
      )}
    </Box>
  );
}
