import { Suspense } from "react";
import PageContent from "./page-content";
import Loading from "../../loading";

type Props = {
  params: { language: string; token: string };
};

export default function InvitePage({ params }: Props) {
  return (
    <Suspense fallback={<Loading />}>
      <PageContent params={params} />
    </Suspense>
  );
}
