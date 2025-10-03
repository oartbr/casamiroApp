"use client";

import React from "react";
import { useTranslation } from "@/services/i18n/client";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "@/components/link";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { RoleEnum } from "@/services/api/types/role";
import { useGroupQuery } from "@/services/api/react-query/groups-queries";
import ListsContainer from "@/components/lists/lists-container";

interface ListsPageContentProps {
  params: { language: string; id: string };
}

function ListsPageContent({ params }: ListsPageContentProps) {
  const groupId = params.id;
  const { t } = useTranslation("groups");

  const {
    data: group,
    isLoading: groupLoading,
    error: groupError,
  } = useGroupQuery(groupId);

  if (groupLoading) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
          Loading...
        </Typography>
      </Container>
    );
  }

  if (groupError || !group) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" color="error" sx={{ mt: 4, mb: 2 }}>
          Error loading group: {groupError?.message || "Group not found"}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 2 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" mb={3}>
          <Button
            component={Link}
            href={`/groups/${groupId}`}
            startIcon={<ArrowBackIcon />}
            sx={{ mr: 2 }}
          >
            {t("actions.back")}
          </Button>
          <Box flex={1}>
            <Typography variant="h3">{group.name} - Lists</Typography>
            {group.description && (
              <Typography variant="body1" color="text.secondary">
                {group.description}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Lists Container */}
        <ListsContainer groupId={groupId} />
      </Box>
    </Container>
  );
}

export default withPageRequiredAuth(ListsPageContent, {
  roles: [RoleEnum.ADMIN, RoleEnum.USER],
});
