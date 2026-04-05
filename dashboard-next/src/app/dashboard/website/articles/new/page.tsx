import { ArticleForm } from '../article-form';

export default function NewArticlePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">New Article</h1>
        <p className="text-muted-foreground">Create a new article or blog post.</p>
      </div>

      <ArticleForm />
    </div>
  );
}
