import React from "react";
import Chip from "@mui/material/Chip";

interface RoleChipProps {
  group: { role: string };
}

const RoleChip: React.FC<RoleChipProps> = ({ group }) => (
  <Chip
    label={group.role}
    size="small"
    sx={{ marginLeft: (theme) => theme.spacing(2) }}
    color={
      group.role === "admin"
        ? "error"
        : group.role === "editor"
          ? "warning"
          : "default"
    }
  />
);

export default RoleChip;
