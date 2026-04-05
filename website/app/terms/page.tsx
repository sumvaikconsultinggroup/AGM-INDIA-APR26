import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Avdheshanand Mission',
  description: 'Terms of service for Avdheshanand Mission web and mobile platforms.',
};

export default function TermsPage() {
  return (
    <div className="pt-24 pb-20 bg-temple-warm min-h-screen">
      <div className="container-custom max-w-4xl">
        <h1 className="font-display text-4xl text-spiritual-maroon mb-6">Terms of Service</h1>
        <p className="text-spiritual-warmGray mb-8">Effective date: April 4, 2026</p>

        <div className="space-y-8 text-spiritual-warmGray leading-relaxed">
          <section>
            <h2 className="font-display text-2xl text-spiritual-maroon mb-3">Use of Platform</h2>
            <p>
              By using this platform, you agree to use services lawfully and respectfully. Misuse,
              unauthorized access attempts, and harmful activity are prohibited.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-spiritual-maroon mb-3">Content and Availability</h2>
            <p>
              We work to keep information accurate and services available, but features may change or be
              interrupted without notice during maintenance or operational updates.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-spiritual-maroon mb-3">Donations and Registrations</h2>
            <p>
              Donation processing and event registration flows may involve third-party services. You are
              responsible for providing accurate information and reviewing transaction details before submission.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-spiritual-maroon mb-3">Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, the platform is provided &quot;as is&quot; without guarantees of
              uninterrupted operation, and liability is limited for indirect or consequential losses.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
