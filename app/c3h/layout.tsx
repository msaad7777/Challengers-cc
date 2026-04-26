import C3HProviders from './providers';

export const metadata = {
  title: 'C3H — Members Portal | Challengers Cricket Club',
  description:
    "C3H is the private members portal for Challengers Cricket Club. The Nets, The Dugout, The Scoreboard, and The Pavilion.",
};

export default function C3HLayout({ children }: { children: React.ReactNode }) {
  return <C3HProviders>{children}</C3HProviders>;
}
