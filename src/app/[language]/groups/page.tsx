import { Suspense } from "react";
import PageContent from "./page-content";
import Loading from "../loading";

interface GroupsPageProps {
  params: { language: string };
}

export default function GroupsPage({ params }: GroupsPageProps) {
  return (
    <Suspense fallback={<Loading />}>
      <PageContent params={{ ...params, slug: "", id: "" }} />
    </Suspense>
  );
}
