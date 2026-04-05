import { PodcastForm } from '../podcast-form';

export default function NewPodcastPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">New Podcast</h1>
        <p className="text-muted-foreground">Create a new podcast episode.</p>
      </div>

      <PodcastForm />
    </div>
  );
}
