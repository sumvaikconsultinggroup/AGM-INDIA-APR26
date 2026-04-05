import { VideoSeriesForm } from '../video-series-form';

export default function NewVideoSeriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">New Video Series</h1>
        <p className="text-muted-foreground">Create a new video series.</p>
      </div>

      <VideoSeriesForm />
    </div>
  );
}
