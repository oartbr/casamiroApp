import HexagonLoaderWithTriangle from "@/components/loaders/hexagonTriangleLoader";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";

function Loading() {
  return (
    <Box sx={{ width: "100%" }} className="fullpageloader">
      <LinearProgress color="primary" sx={{ mt: "-4px" }} />
      <HexagonLoaderWithTriangle size={350} speed={0.2} strokeWidth={10} />
    </Box>
  );
}

export default Loading;
