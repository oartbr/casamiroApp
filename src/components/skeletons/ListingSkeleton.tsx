import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";

export function ListingSkeleton() {
  return (
    <Container maxWidth="lg" className="mainContainer">
      <Box sx={{ mt: 2 }}>
        <FormControl fullWidth sx={{ mb: 3, mt: 1 }}>
          <InputLabel>
            <Skeleton variant="text" width={120} />
          </InputLabel>
          <Skeleton variant="rectangular" height={56} />
        </FormControl>
      </Box>
      <Grid container spacing={3} rowSpacing={3}>
        {[1, 2, 3].map((i) => (
          <Grid item xs={12} key={i}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
                  <Skeleton variant="rectangular" width={80} height={80} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="70%" height={32} />
                    <Skeleton variant="text" width="50%" height={24} />
                    <Skeleton variant="text" width="60%" height={20} />
                  </Box>
                </Box>
                <Skeleton variant="text" width="100%" />
                <Skeleton variant="text" width="90%" />
                <Skeleton variant="text" width="80%" />
                <Box sx={{ mt: 2 }}>
                  <Skeleton variant="rectangular" width={120} height={36} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
