// components/Version.tsx
export default function Version() {
  const commitSha =
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    "Local";

  const date = new Date().toISOString().slice(0, 16);

  return (
    <div className="version">
      [ V: {date} | {commitSha.slice(0, 7)} ]
      {process.env.NEXT_PUBLIC_VERCEL_ENV &&
        ` • ${process.env.NEXT_PUBLIC_VERCEL_ENV}`}
    </div>
  );
}
