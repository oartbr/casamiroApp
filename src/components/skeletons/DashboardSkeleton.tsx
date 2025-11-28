import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

export function DashboardSkeleton() {
  return (
    <Container maxWidth="lg" className="mainContainer" sx={{ width: "100%" }}>
      <Grid
        container
        spacing={3}
        pt={3}
        direction="column"
        sx={{ minHeight: "60vh", alignItems: "center", width: "100%" }}
      >
        <Grid item xs={12} md={6}>
          <Skeleton variant="text" width="100%" height={40} sx={{ mb: 2 }} />
          <Card>
            <Skeleton variant="rectangular" height={140} />
            <CardContent>
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Skeleton variant="text" width="50%" height={32} sx={{ mb: 2 }} />
          <Box sx={{ mb: 2 }}>
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="90%" />
            <Skeleton variant="text" width="80%" />
          </Box>
          <Skeleton variant="rectangular" width={150} height={36} />
        </Grid>
      </Grid>
    </Container>
  );
}
