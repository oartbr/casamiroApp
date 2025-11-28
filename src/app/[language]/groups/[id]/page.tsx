import { Suspense } from "react";
import PageContent from "./page-content";
import { GroupDetailSkeleton } from "@/components/skeletons/GroupDetailSkeleton";

type Props = {
  params: { language: string; id: string };
};

export default function GroupDetailPage({ params }: Props) {
  return (
    <Suspense fallback={<GroupDetailSkeleton />}>
      <PageContent params={{ ...params, slug: "", id: params.id }} />
    </Suspense>
  );
}
