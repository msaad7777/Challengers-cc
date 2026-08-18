import { redirect } from 'next/navigation';

export const metadata = {
  title: 'The Mental Game — Challengers Cricket Club',
  description: 'The Mental Game guide is members-only. Sign in through C3H for the pre-match, during-match, and post-match mental tools.',
};

export default function MentalGameRedirect() {
  redirect('/c3h/mental-game');
}
