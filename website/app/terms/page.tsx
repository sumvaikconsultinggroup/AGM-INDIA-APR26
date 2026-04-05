import { Metadata } from 'next';
import { PageHero } from '@/components/ui/PageHero';
import { Scale } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service | Avdheshanand Mission',
  description: 'Terms of service for Avdheshanand Mission web and mobile platforms.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen pt-20">
      <PageHero
        eyebrow="Policy"
        title="Terms of"
        highlight="Service"
        subtitle="The operating terms, responsibilities, and usage expectations for AGM web and mobile platforms."
        icon={<Scale className="h-7 w-7" />}
      />
      <div className="bg-temple-warm py-12">
        <div className="container-custom max-w-4xl">
          <p className="mb-8 text-sm uppercase tracking-[0.24em] text-spiritual-warmGray">Effective date: April 4, 2026</p>

          <div className="card-temple space-y-8 p-8 text-spiritual-warmGray leading-relaxed md:p-10">
            <section>
              <h2 className="mb-3 font-display text-2xl text-spiritual-maroon">Use of Platform</h2>
            <p>
              By using this platform, you agree to use services lawfully and respectfully. Misuse,
              unauthorized access attempts, and harmful activity are prohibited.
            </p>
            </section>

            <section>
              <h2 className="mb-3 font-display text-2xl text-spiritual-maroon">Content and Availability</h2>
            <p>
              We work to keep information accurate and services available, but features may change or be
              interrupted without notice during maintenance or operational updates.
            </p>
            </section>

            <section>
              <h2 className="mb-3 font-display text-2xl text-spiritual-maroon">Donations and Registrations</h2>
            <p>
              Donation processing and event registration flows may involve third-party services. You are
              responsible for providing accurate information and reviewing transaction details before submission.
            </p>
            </section>

            <section>
              <h2 className="mb-3 font-display text-2xl text-spiritual-maroon">Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, the platform is provided &quot;as is&quot; without guarantees of
              uninterrupted operation, and liability is limited for indirect or consequential losses.
            </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
