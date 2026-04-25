import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Watch Live — Challengers Cricket Club',
  description: 'Live match streaming is members-only. Sign in through C3H to watch live matches and access the video archive.',
};

export default function WatchRedirect() {
  redirect('/c3h/watch');
}
