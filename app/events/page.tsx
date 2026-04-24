import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Events — Challengers Cricket Club',
  description: 'Club events are members-only. Sign in through C3H to view upcoming events and calendar integration.',
};

export default function EventsRedirect() {
  redirect('/c3h/events');
}
