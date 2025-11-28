import { Suspense } from "react";
import PageContent from "./page-content";
import { GroupsListSkeleton } from "@/components/skeletons/GroupsListSkeleton";

interface GroupsPageProps {
  params: { language: string };
}

export default function GroupsPage({ params }: GroupsPageProps) {
  return (
    <Suspense fallback={<GroupsListSkeleton />}>
      <PageContent params={{ ...params, slug: "", id: "" }} />
    </Suspense>
  );
}
