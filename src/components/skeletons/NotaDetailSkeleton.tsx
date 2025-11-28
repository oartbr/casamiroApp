import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";

export function NotaDetailSkeleton() {
  return (
    <Container maxWidth="sm" className="mainContainer">
      <Grid>
        <Grid>
          <Skeleton variant="text" width="40%" height={40} sx={{ mb: 3 }} />
        </Grid>
        <Grid container spacing={3} rowSpacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
                  <Skeleton variant="rectangular" width={100} height={100} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="80%" height={32} />
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="text" width="70%" height={20} />
                  </Box>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Skeleton variant="text" width="100%" />
                  <Skeleton variant="text" width="90%" />
                  <Skeleton variant="text" width="85%" />
                  <Skeleton variant="text" width="95%" />
                </Box>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <Skeleton variant="rectangular" width={100} height={36} />
                  <Skeleton variant="rectangular" width={80} height={36} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}
