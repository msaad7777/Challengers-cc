import C3HProviders from './providers';

export default function C3HLayout({ children }: { children: React.ReactNode }) {
  return <C3HProviders>{children}</C3HProviders>;
}
