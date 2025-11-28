import { Metadata } from "next";
import { Suspense } from "react";
import ListsPageContent from "./page-content";
import { ListsSkeleton } from "@/components/skeletons/ListsSkeleton";

export const metadata: Metadata = {
  title: "Lists",
  description: "Manage your lists and items",
};

interface ListsPageProps {
  params: { language: string };
}

export default function ListsPage({ params }: ListsPageProps) {
  return (
    <Suspense fallback={<ListsSkeleton />}>
      <ListsPageContent params={params} />
    </Suspense>
  );
}
