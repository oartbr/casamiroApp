import { Metadata } from "next";
import { Suspense } from "react";
import ListsPageContent from "./page-content";
import { GroupListsSkeleton } from "@/components/skeletons/GroupListsSkeleton";

export const metadata: Metadata = {
  title: "Lists",
  description: "Manage group lists and items",
};

interface ListsPageProps {
  params: { language: string; id: string };
}

export default function ListsPage({ params }: ListsPageProps) {
  return (
    <Suspense fallback={<GroupListsSkeleton />}>
      <ListsPageContent params={params} />
    </Suspense>
  );
}
