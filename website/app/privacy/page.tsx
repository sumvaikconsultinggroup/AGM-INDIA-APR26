import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Avdheshanand Mission',
  description: 'Privacy policy for Avdheshanand Mission web and mobile platforms.',
};

export default function PrivacyPage() {
  return (
    <div className="pt-24 pb-20 bg-temple-warm min-h-screen">
      <div className="container-custom max-w-4xl">
        <h1 className="font-display text-4xl text-spiritual-maroon mb-6">Privacy Policy</h1>
        <p className="text-spiritual-warmGray mb-8">Last updated: April 4, 2026</p>

        <div className="space-y-8 text-spiritual-warmGray leading-relaxed">
          <section>
            <h2 className="font-display text-2xl text-spiritual-maroon mb-3">Information We Collect</h2>
            <p>
              We collect information you provide directly, including contact details, volunteer form
              submissions, event registrations, and donation details needed to process requests securely.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-spiritual-maroon mb-3">How We Use Information</h2>
            <p>
              We use your information to manage services, communicate updates, improve platform experience,
              support mission activities, and maintain safety and fraud prevention controls.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-spiritual-maroon mb-3">Data Sharing</h2>
            <p>
              We do not sell personal information. We may share limited data with trusted service providers
              for operations such as hosting, secure payments, and analytics under contractual safeguards.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-spiritual-maroon mb-3">Your Choices</h2>
            <p>
              You may request correction or deletion of personal data where legally permitted. For requests,
              contact us through the platform contact form.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
