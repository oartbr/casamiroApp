import { Metadata } from "next";
import ListsPageContent from "./page-content";

export const metadata: Metadata = {
  title: "Lists",
  description: "Manage group lists and items",
};

interface ListsPageProps {
  params: { language: string; id: string };
}

export default function ListsPage({ params }: ListsPageProps) {
  return <ListsPageContent params={params} />;
}
