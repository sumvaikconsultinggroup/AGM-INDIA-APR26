import { BookForm } from '../book-form';

export default function NewBookPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">New Book</h1>
        <p className="text-muted-foreground">Add a new book to your collection.</p>
      </div>

      <BookForm />
    </div>
  );
}
