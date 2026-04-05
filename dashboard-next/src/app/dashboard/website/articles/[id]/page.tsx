'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { ArticleForm } from '../article-form';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'next/navigation';

// Interface for article data fetched from API
interface Article {
  _id: string;
  title: string;
  description: string;
  coverImage?: string;
  link?: string;
  category?: string;
  publishedDate?: string;
  readTime?: number;
}

export default function Page() {
  const params = useParams();
    const paramId = params.id as string;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/articles/${paramId}`);
        
        if (response.data.success) {
          setArticle(response.data.data);
        } else {
          toast.error(response.data.message || 'Failed to load article');
          setError('Failed to load article');
        }
      } catch (err) {
        console.error('Error fetching article:', err);
        toast.error('Could not load article. It may have been deleted or doesn\'t exist.');
        setError('Article not found');
        setTimeout(() => router.push('/dashboard/website/articles'), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [paramId, router]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-72" />
        </div>
        
        <div className="space-y-4">
          <Skeleton className="h-[500px] w-full rounded-md" />
          <div className="flex justify-end space-x-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-16">
        <div className="rounded-full bg-red-100 p-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold">Article Not Found</h3>
        <p className="text-center text-muted-foreground">
          We couldn&apos;t find the article you&apos;re looking for.
          <br />
          You&apos;ll be redirected to the articles page shortly.
        </p>
        <button
          className="mt-2 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          onClick={() => router.push('/dashboard/website/articles')}
        >
          Go back to articles
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Edit Article</h1>
        <p className="text-muted-foreground">Update the details of this article.</p>
      </div>

      {article && <ArticleForm initialData={article} />}
    </div>
  );
}
