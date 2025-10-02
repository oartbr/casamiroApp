//import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Nota } from "../../services/api/types/nota";
import dayjs from "dayjs";

import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/pt-br";
import Grid from "@mui/material/Grid";

dayjs.extend(relativeTime);

// import { Label } from "@mui/icons-material";
// import IconName from '@mui/icons-material/IconName'

function makeMoney(amount: number) {
  return `R$${amount.toFixed(2)}`;
}

export type Item = {
  code: string;
  notaId: string;
  product: string;
  purchaseDate: string;
  quantity: number;
  totalPrice: number;
  unitPrice: number;
  vendor: string;
};

export type NotaCardProps = {
  item: Nota;
  onClick: () => void;
  action: string;
  type: string;
};

export function NotaCard({ item, onClick, action, type }: NotaCardProps) {
  // console.log({ item });

  return (
    <div>
      <Card elevation={3} className={`${item.status}Card`}>
        <CardContent>
          <Typography variant="h1" component="div" sx={{ fontSize: 26 }}>
            {(() => {
              const registerDate = new Date(
                item.registeredAt
              ).toLocaleDateString(undefined, {
                day: "2-digit",
                month: "2-digit",
              });

              const purchaseDate = new Date(
                item.purchaseDate
              ).toLocaleDateString(undefined, {
                day: "2-digit",
                month: "2-digit",
              });

              switch (item.status) {
                case "pending":
                  return `⌛ Registrada em ${registerDate}, ${dayjs(item.registeredAt).locale("pt-br").fromNow()}.`;
                case "read":
                  return `📃 Compra feita ${dayjs(item.purchaseDate).locale("pt-br").fromNow()}.`;
                case "canceled":
                  return `😱 Cancelada em ${purchaseDate}`;
                case "flagged":
                  return `📣 A nota foi marcada em ${purchaseDate}`;
                default:
                  return "";
              }
            })()}
          </Typography>
          <Typography
            variant="h6"
            component="div"
            sx={{
              color: "text.secondary",
              marginLeft: (theme) => theme.spacing(5),
            }}
          >
            {item.vendorName}
          </Typography>
          <Typography
            sx={{
              color: "text.secondary",
              marginLeft: (theme) => theme.spacing(5),
            }}
          >
            {dayjs(item.purchaseDate)
              .locale("pt-br")
              .format("DD/MM/YYYY HH:mm")}
          </Typography>

          {/* Group Information */}
          {item.group && (
            <Typography
              variant="body2"
              sx={{
                color: "primary.main",
                marginLeft: (theme) => theme.spacing(5),
                fontWeight: "medium",
              }}
            >
              📁 {item.group.name}
            </Typography>
          )}

          <Grid
            container
            spacing={2}
            sx={{
              fontSize: "small",
              marginLeft: (theme) => theme.spacing(1),
              marginTop: (theme) => theme.spacing(2),
            }}
          >
            {type === "details"
              ? (item.items as Item[]).map((item: Item, idx: number) => (
                  <Grid
                    container
                    item
                    xs={12}
                    key={idx}
                    spacing={1}
                    direction="row"
                    sx={{
                      fontSize: "small",
                      fontFamily: "monospace",
                    }}
                  >
                    <Grid item xs={5} sx={{ textAlign: "left" }}>
                      {item.product}
                    </Grid>
                    <Grid item xs={3} sx={{ textAlign: "right" }}>
                      {item.quantity} x {item.unitPrice}
                    </Grid>
                    <Grid item xs={3} sx={{ textAlign: "right" }}>
                      {makeMoney(item.totalPrice)}
                    </Grid>
                  </Grid>
                ))
              : null}
          </Grid>
          <Typography
            sx={{
              color: "text.secondary",
              marginRight: (theme) => theme.spacing(2),
              textAlign: "right",
              marginTop: (theme) => theme.spacing(2),
              fontFamily: "monospace",
            }}
          >
            {Number(item.total) > 0 && `R$${item.total.toFixed(2)}`}
          </Typography>
        </CardContent>
        <CardActions>
          <Button onClick={onClick}>{action}</Button>
        </CardActions>
      </Card>
    </div>
  );
}
