// Session is now provided at the root layout level via app/providers.tsx.
// This file is kept as a passthrough so existing c3h/layout.tsx imports still work.
export default function C3HProviders({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
