import { Suspense } from "react";
import PageContent from "./page-content";
import Loading from "../../loading";

type Props = {
  params: { language: string; id: string };
};

export default function GroupDetailPage({ params }: Props) {
  return (
    <Suspense fallback={<Loading />}>
      <PageContent params={{ ...params, slug: "", id: params.id }} />
    </Suspense>
  );
}
