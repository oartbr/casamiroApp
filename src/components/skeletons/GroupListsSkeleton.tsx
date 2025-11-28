import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

export function GroupListsSkeleton() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 2 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Skeleton
            variant="rectangular"
            width={100}
            height={36}
            sx={{ mr: 2 }}
          />
          <Skeleton
            variant="rectangular"
            width={80}
            height={80}
            sx={{ mr: 2 }}
          />
          <Box flex={1}>
            <Skeleton variant="text" width="60%" height={40} />
            <Skeleton variant="text" width="80%" height={24} />
          </Box>
        </Box>
        <Skeleton variant="rectangular" height={400} />
      </Box>
    </Container>
  );
}
