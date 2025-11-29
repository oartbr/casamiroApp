"use client";

import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
// import ListItemText from "@mui/material/ListItemText";
import { useGroupMembershipsQuery } from "@/services/api/react-query/memberships-queries";
import { Nota } from "@/services/api/types/nota";
import { ListItem as ListItemType } from "@/services/api/types/list";
import { useMemo } from "react";
import Avatar from "@mui/material/Avatar";
import Grid from "@mui/material/Grid";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import { useTranslation } from "@/services/i18n/client";
import Button from "@mui/material/Button/Button";

interface UserTasksProps {
  latestNota: Nota | null;
  defaultListItems: ListItemType[];
  activeGroupId: string;
  action: {
    title: string;
    href: string;
  };
}

export function UserTasks({
  latestNota,
  defaultListItems,
  activeGroupId,
  action,
}: UserTasksProps) {
  const { t } = useTranslation("dashboard");
  // Fetch group memberships to check if user is alone
  const { data: membershipsData } = useGroupMembershipsQuery(activeGroupId, {
    limit: 100,
    status: "active",
  });

  // Check if user is alone in the group
  const isAlone = useMemo(() => {
    if (!activeGroupId || !membershipsData?.results) return false;
    // Filter active memberships (excluding pending invitations)
    const activeMembers = membershipsData.results.filter(
      (m) => m.status === "active"
    );
    return activeMembers.length <= 1;
  }, [membershipsData, activeGroupId]);

  // Build tasks list
  const tasks = useMemo(() => {
    const taskList: {
      label: string;
      action?: { title: string; href: string };
    }[] = [];

    // Always show this task
    taskList.push({ label: t("tasks.learning") });

    // Check if user has no notas
    if (!latestNota) {
      taskList.push({ label: t("tasks.scanNotas") });
    }

    // Check if user has no items in their standard list
    if (!defaultListItems || defaultListItems.length === 0) {
      taskList.push({ label: t("tasks.useList") });
    }

    // Check if user is alone in their group
    if (isAlone && activeGroupId) {
      taskList.push({ label: t("tasks.inviteFamily"), action: action });
    }

    return taskList;
  }, [latestNota, defaultListItems, isAlone, activeGroupId, t, action]);

  if (tasks.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 0, mb: 0 }}>
      <Grid item xs={12} md={12}>
        <List>
          {tasks.map((task, index) => (
            <ListItem
              key={index}
              sx={{
                px: 0,
                fontWeight: "light",
                display: "flex",
              }}
            >
              <ListItemAvatar sx={{ alignSelf: "flex-start" }}>
                <Avatar
                  alt="Casamiro"
                  src="/logo.casamiro.short.png"
                  variant="square"
                />
              </ListItemAvatar>
              {task.label}
              {task.action && (
                <Button
                  href={task.action.href}
                  variant="contained"
                  color="primary"
                  sx={{ ml: 1 }}
                >
                  {task.action.title}
                </Button>
              )}
            </ListItem>
          ))}
        </List>
      </Grid>
    </Box>
  );
}
