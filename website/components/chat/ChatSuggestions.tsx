// website/components/chat/ChatSuggestions.tsx
'use client';

interface ChatSuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

export function ChatSuggestions({ suggestions, onSelect }: ChatSuggestionsProps) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="mt-2 ml-10 space-y-1">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSelect(suggestion)}
          className="block w-full text-left text-xs p-2 bg-white border border-spiritual-maroon/20 rounded-lg hover:bg-spiritual-saffron/5 transition-colors text-spiritual-warmGray hover:text-spiritual-maroon"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
