"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/services/i18n/client";
import { useRouter } from "next/navigation";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Box from "@mui/material/Box";
import useAuth from "@/services/auth/use-auth";
import {
  useGroupQuery,
  useUpdateGroupMutation,
} from "@/services/api/react-query/groups-queries";
import { useGroupMembershipsQuery } from "@/services/api/react-query/memberships-queries";
import { Group } from "@/services/api/types/group";
import { Membership } from "@/services/api/types/membership";
import Link from "@/components/link";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { RoleEnum } from "@/services/api/types/role";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";

interface GroupEditPageContentProps {
  params: { [key: string]: string | undefined };
}

function GroupEditPageContent({ params }: GroupEditPageContentProps) {
  const groupId = params.id!;
  const { t } = useTranslation("groups");
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<Group>>({
    name: "",
    description: "",
    settings: {
      allowInvitations: true,
      requireApproval: false,
    },
  });
  const [isFormDirty, setIsFormDirty] = useState(false);

  const {
    data: group,
    isLoading: groupLoading,
    error: groupError,
  } = useGroupQuery(groupId);
  const { data: membershipsData } = useGroupMembershipsQuery(groupId);
  const updateGroupMutation = useUpdateGroupMutation();

  // Initialize form data when group loads
  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name || "",
        description: group.description || "",
        settings: {
          allowInvitations: group.settings?.allowInvitations ?? true,
          requireApproval: group.settings?.requireApproval ?? false,
        },
      });
      setIsFormDirty(false);
    }
  }, [group]);

  // Check if user has admin role to edit this group
  // User can edit if they are the creator OR if they have admin role in memberships

  console.log({ group, user });

  // Helper function to get createdBy ID (handles both string and object cases)
  const getCreatedById = (
    createdBy:
      | string
      | { _id: string; firstName: string; lastName: string; email: string }
      | undefined
  ) => {
    if (typeof createdBy === "object" && createdBy) {
      return createdBy._id;
    }
    return createdBy;
  };

  // Helper function to get createdBy display name
  const getCreatedByDisplayName = (
    createdBy:
      | string
      | { _id: string; firstName: string; lastName: string; email: string }
      | undefined
  ) => {
    if (typeof createdBy === "object" && createdBy) {
      return `${createdBy.firstName} ${createdBy.lastName}`;
    }
    return createdBy;
  };

  // Get active members count from memberships data
  const memberships = membershipsData?.results || [];
  const activeMembersCount = memberships.filter(
    (m: Membership) => m.status === "active"
  ).length;

  const canEdit =
    group?.ownerId === user?.id ||
    getCreatedById(group?.createdBy) === user?.id ||
    memberships.some(
      (member: Membership) =>
        member.user_id === user?.id && member.role === "admin"
    );

  // Debug logging
  console.log("Group data:", {
    groupId,
    groupCreatedBy: getCreatedById(group?.createdBy),
    user: user?.id,
    members: group?.members,
    memberships: memberships,
    activeMembersCount: activeMembersCount,
    canEdit,
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setIsFormDirty(true);
  };

  const handleSettingsChange = (setting: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      settings: {
        ...(prev.settings ?? {}),
        [setting]: value as boolean,
      } as NonNullable<typeof prev.settings>,
    }));
    setIsFormDirty(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      return;
    }

    try {
      await updateGroupMutation.mutateAsync({
        groupId: groupId,
        data: {
          name: formData.name.trim(),
          description: formData.description?.trim() || "",
        },
      });

      // Redirect to group detail page
      router.push(`/groups/${groupId}`);
    } catch (error) {
      console.error("Failed to update group:", error);
    }
  };

  const handleCancel = () => {
    router.push(`/groups/${groupId}`);
  };

  if (groupLoading) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
          Loading group...
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
        <Button
          component={Link}
          href="/groups"
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          {t("actions.back")}
        </Button>
      </Container>
    );
  }

  if (!canEdit) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" color="error" sx={{ mt: 4, mb: 2 }}>
          Access Denied
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          You don&apos;t have permission to edit this group. Only group
          administrators can edit group details.
        </Typography>
        <Button
          component={Link}
          href={`/groups/${groupId}`}
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          {t("actions.back")}
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Header */}
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" mb={2}>
            <Button
              component={Link}
              href={`/groups/${groupId}`}
              startIcon={<ArrowBackIcon />}
              sx={{ mr: 2 }}
            >
              {t("actions.back")}
            </Button>
            <Typography variant="h3">{t("groups:edit.title")}</Typography>
          </Box>
        </Grid>

        {/* Edit Form */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t("groups:form.name")}
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      required
                      variant="outlined"
                      error={!formData.name?.trim()}
                      helperText={
                        !formData.name?.trim()
                          ? t("groups:form.nameRequired")
                          : ""
                      }
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t("groups:form.description")}
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      multiline
                      rows={4}
                      variant="outlined"
                      placeholder={t("groups:form.descriptionPlaceholder")}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      {t("groups:form.settings")}
                    </Typography>

                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.settings?.allowInvitations ?? true}
                          onChange={(e) =>
                            handleSettingsChange(
                              "allowInvitations",
                              e.target.checked
                            )
                          }
                        />
                      }
                      label={t("groups:form.allowInvitations")}
                    />

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ ml: 4, mb: 2 }}
                    >
                      {t("groups:form.allowInvitationsHelp")}
                    </Typography>

                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.settings?.requireApproval ?? false}
                          onChange={(e) =>
                            handleSettingsChange(
                              "requireApproval",
                              e.target.checked
                            )
                          }
                        />
                      }
                      label={t("groups:form.requireApproval")}
                    />

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ ml: 4 }}
                    >
                      {t("groups:form.requireApprovalHelp")}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Box display="flex" gap={2} justifyContent="flex-end">
                      <Button
                        variant="outlined"
                        onClick={handleCancel}
                        disabled={updateGroupMutation.isPending}
                      >
                        {t("actions.cancel")}
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<SaveIcon />}
                        disabled={
                          !isFormDirty ||
                          !formData.name?.trim() ||
                          updateGroupMutation.isPending
                        }
                      >
                        {updateGroupMutation.isPending
                          ? t("actions.saving")
                          : t("actions.save")}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Group Info Sidebar */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t("groups:edit.currentInfo")}
              </Typography>

              <Typography variant="body2" color="text.secondary" paragraph>
                <strong>{t("groups:info.created")}:</strong>{" "}
                {new Date(group.createdAt).toLocaleDateString()}
              </Typography>

              <Typography variant="body2" color="text.secondary" paragraph>
                <strong>{t("groups:info.members")}:</strong>{" "}
                {activeMembersCount}
              </Typography>

              <Typography variant="body2" color="text.secondary" paragraph>
                <strong>{t("groups:info.createdBy")}:</strong>{" "}
                {getCreatedByDisplayName(group.createdBy)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default withPageRequiredAuth(GroupEditPageContent, {
  roles: [RoleEnum.ADMIN, RoleEnum.USER],
});
