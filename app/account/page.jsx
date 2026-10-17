import AccountClient from './AccountClient';

export const metadata = {
  title: 'Log in or Sign up',
  description: 'Log in or create your Mr. Rent account to find verified rentals and properties in Nigeria.',
  robots: { index: false, follow: true },
};

export default function AccountPage() {
  return <AccountClient />;
}