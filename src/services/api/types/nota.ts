export type Nota = {
  id: String;
  user: String;
  groupId?: Object;
  group?: {
    id: String;
    name: String;
  };
  url: String;
  purchaseDate: Date;
  registeredAt: Date;
  status: String;
  readAt: Date;
  code: String;
  vendor: {
    name: String;
    CNPJ: String;
    address: Object;
    gps: Object;
  };
  items: Array<Object>;
  total: Number;
  vendorName: String;
};
