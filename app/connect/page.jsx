import ConnectClient from '../api/connect/ConnectClient';

export const metadata = {
  title: 'Contact Us | Faster Aim Rentals',
  description: 'Get support or explore partnership opportunities with Faster Aim Rentals.',
};

export default function ConnectPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Us</h1>
        <p className="text-gray-600 mb-8">
          Need support or interested in a partnership? Send us a message.
        </p>
        <ConnectClient />
      </div>
    </main>
  );
}