export default function SolveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Override the app layout's max-width and padding for full-screen test experience
  return <div className="-mx-6 -my-8">{children}</div>;
}
