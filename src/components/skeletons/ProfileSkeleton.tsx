import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";

export function ProfileSkeleton() {
  return (
    <Container maxWidth="md">
      <Grid container spacing={3} pt={3}>
        <Grid item xs={12} md={6}>
          <Grid container spacing={3} direction="column" alignItems="center">
            <Grid item xs="auto">
              <Skeleton variant="circular" width={160} height={160} />
            </Grid>
            <Grid item>
              <Skeleton variant="text" width={200} height={40} />
              <Skeleton variant="text" width={180} height={32} />
            </Grid>
            <Grid item>
              <Skeleton variant="rectangular" width={150} height={40} />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="50%" height={32} sx={{ mb: 2 }} />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>
                  <Skeleton variant="text" width={100} />
                </InputLabel>
                <Skeleton variant="rectangular" height={56} />
              </FormControl>
              <Skeleton variant="text" width="100%" />
              <Skeleton variant="text" width="80%" />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
