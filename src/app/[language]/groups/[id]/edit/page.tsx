"use client";

import GroupEditPageContent from "./page-content";

type Props = {
  params: { language: string; id: string };
};

export default function GroupEditPage({ params }: Props) {
  const groupId = params.id as string;

  return (
    <GroupEditPageContent
      params={{ ...params, slug: "", id: groupId, language: params.language }}
    />
  );
}
