import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Swami Ji | Avdheshanandg Mission',
  description:
    'Discover the life, teachings, and divine mission of His Holiness Swami Avdheshanand Giri Ji Maharaj — Acharya Mahamandaleshwar of Juna Akhara and President of the Hindu Dharma Acharya Sabha.',
  keywords: [
    'Swami Avdheshanand Giri',
    'Juna Akhara',
    'Hindu Dharma Acharya Sabha',
    'spiritual leader',
    'Vedanta',
    'Haridwar',
    'Sanatan Dharma',
  ],
  openGraph: {
    title: 'About Swami Ji | Avdheshanandg Mission',
    description:
      'Discover the life, teachings, and divine mission of His Holiness Swami Avdheshanand Giri Ji Maharaj.',
    type: 'profile',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
