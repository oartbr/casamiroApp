import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import Paper from "@mui/material/Paper";

export function GroupDetailSkeleton() {
  return (
    <Container maxWidth="lg">
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Header */}
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" mb={2}>
            <Skeleton
              variant="rectangular"
              width={80}
              height={80}
              sx={{ mr: 2 }}
            />
            <Box flex={1}>
              <Skeleton variant="text" width="40%" height={40} />
              <Skeleton variant="text" width="60%" height={24} sx={{ mt: 1 }} />
              <Skeleton
                variant="text"
                width="30%"
                height={20}
                sx={{ mt: 0.5 }}
              />
            </Box>
          </Box>
        </Grid>

        {/* Members Section */}
        <Grid item xs={12}>
          <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Skeleton variant="text" width={80} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={60} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={80} />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton variant="text" width={60} />
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[1, 2, 3, 4].map((i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Skeleton variant="circular" width={32} height={32} />
                        <Skeleton variant="text" width={120} />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={80} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={100} />
                    </TableCell>
                    <TableCell align="right">
                      <Skeleton variant="circular" width={40} height={40} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Pending Invitations Section */}
        <Grid item xs={12}>
          <Skeleton variant="text" width="35%" height={32} sx={{ mb: 2 }} />
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Skeleton variant="text" width={100} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={60} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={100} />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton variant="text" width={60} />
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[1, 2].map((i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton variant="text" width={150} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={80} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={120} />
                    </TableCell>
                    <TableCell align="right">
                      <Box display="flex" gap={1} justifyContent="flex-end">
                        <Skeleton
                          variant="rectangular"
                          width={80}
                          height={32}
                        />
                        <Skeleton
                          variant="rectangular"
                          width={80}
                          height={32}
                        />
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Box display="flex" gap={1}>
            <Skeleton variant="rectangular" width={100} height={36} />
            <Skeleton variant="rectangular" width={120} height={36} />
            <Skeleton variant="rectangular" width={150} height={36} />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
