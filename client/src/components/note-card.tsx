import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { TagBadge } from '@/components/tag-badge';
import { formatDate, getTextPreview } from '@/lib/utils';

interface NoteCardProps {
  id: number | string;
  title: string;
  content: string;
  updatedAt: Date;
  tags: { id: number | string; name: string; color: string; }[];
}

export function NoteCard({ id, title, content, updatedAt, tags }: NoteCardProps) {
  const [, setLocation] = useLocation();
  
  const handleClick = () => {
    setLocation(`/edit/${id}`);
  };
  
  return (
    <Card 
      className="bg-cardBg rounded-lg shadow-sm mb-3 cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleClick}
    >
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-medium text-white">{title}</h3>
          <span className="text-xs text-gray-400">{formatDate(updatedAt)}</span>
        </div>
        <p className="text-sm text-gray-300 mb-2 line-clamp-2">
          {getTextPreview(content)}
        </p>
        {tags.length > 0 && (
          <div className="flex space-x-2 flex-wrap gap-y-1">
            {tags.map((tag) => (
              <TagBadge key={tag.id} name={tag.name} color={tag.color} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
