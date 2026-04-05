import { Metadata } from 'next';
import { PageHero } from '@/components/ui/PageHero';
import { ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Avdheshanand Mission',
  description: 'Privacy policy for Avdheshanand Mission web and mobile platforms.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen pt-20">
      <PageHero
        eyebrow="Policy"
        title="Privacy"
        highlight="Policy"
        subtitle="How platform data is collected, protected, and used across the AGM website and connected products."
        icon={<ShieldCheck className="h-7 w-7" />}
      />
      <div className="bg-temple-warm py-12">
        <div className="container-custom max-w-4xl">
          <p className="mb-8 text-sm uppercase tracking-[0.24em] text-spiritual-warmGray">Last updated: April 4, 2026</p>

          <div className="card-temple space-y-8 p-8 text-spiritual-warmGray leading-relaxed md:p-10">
            <section>
              <h2 className="mb-3 font-display text-2xl text-spiritual-maroon">Information We Collect</h2>
            <p>
              We collect information you provide directly, including contact details, volunteer form
              submissions, event registrations, and donation details needed to process requests securely.
            </p>
            </section>

            <section>
              <h2 className="mb-3 font-display text-2xl text-spiritual-maroon">How We Use Information</h2>
            <p>
              We use your information to manage services, communicate updates, improve platform experience,
              support mission activities, and maintain safety and fraud prevention controls.
            </p>
            </section>

            <section>
              <h2 className="mb-3 font-display text-2xl text-spiritual-maroon">Data Sharing</h2>
            <p>
              We do not sell personal information. We may share limited data with trusted service providers
              for operations such as hosting, secure payments, and analytics under contractual safeguards.
            </p>
            </section>

            <section>
              <h2 className="mb-3 font-display text-2xl text-spiritual-maroon">Your Choices</h2>
            <p>
              You may request correction or deletion of personal data where legally permitted. For requests,
              contact us through the platform contact form.
            </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
