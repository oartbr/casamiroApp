import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

export function ListsSkeleton() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 2 }}>
        <FormControl fullWidth sx={{ mb: 3, mt: 1 }}>
          <InputLabel>
            <Skeleton variant="text" width={100} />
          </InputLabel>
          <Skeleton variant="rectangular" height={56} />
        </FormControl>
        <Skeleton
          variant="rectangular"
          height={48}
          sx={{ mb: 2, borderRadius: 1 }}
        />
        <List>
          {[1, 2, 3, 4, 5].map((i) => (
            <ListItem key={i}>
              <ListItemText
                primary={<Skeleton variant="text" width="60%" />}
                secondary={<Skeleton variant="text" width="40%" />}
              />
              <Skeleton variant="circular" width={40} height={40} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Container>
  );
}
