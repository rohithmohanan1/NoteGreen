import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Heading1, 
  Heading2, 
  List, 
  ListOrdered, 
  Link as LinkIcon,
  Image as ImageIcon,
  CheckSquare,
  MoreHorizontal
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Image,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'editor-content p-3 bg-cardBg rounded-b-lg focus:outline-none min-h-[200px] prose prose-invert prose-sm max-w-none',
        placeholder: placeholder,
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="rich-text-editor">
      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="flex bg-accent rounded-md shadow-lg overflow-hidden">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive('bold') ? 'bg-accent/60' : ''}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive('italic') ? 'bg-accent/60' : ''}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={editor.isActive('underline') ? 'bg-accent/60' : ''}
            >
              <UnderlineIcon className="h-4 w-4" />
            </Button>
          </div>
        </BubbleMenu>
      )}
      
      {/* Toolbar */}
      <div className="markdown-toolbar flex items-center space-x-2 bg-cardBg p-2 rounded-t-lg overflow-x-auto">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1 h-8 w-8 ${editor.isActive('bold') ? 'bg-accent/30' : ''}`}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1 h-8 w-8 ${editor.isActive('italic') ? 'bg-accent/30' : ''}`}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1 h-8 w-8 ${editor.isActive('underline') ? 'bg-accent/30' : ''}`}
          title="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        
        <div className="h-5 w-px bg-gray-600"></div>
        
        <Button 
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1 h-8 w-8 ${editor.isActive('heading', { level: 1 }) ? 'bg-accent/30' : ''}`}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1 h-8 w-8 ${editor.isActive('heading', { level: 2 }) ? 'bg-accent/30' : ''}`}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1 h-8 w-8 ${editor.isActive('bulletList') ? 'bg-accent/30' : ''}`}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1 h-8 w-8 ${editor.isActive('orderedList') ? 'bg-accent/30' : ''}`}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        
        <div className="h-5 w-px bg-gray-600"></div>
        
        <Button 
          variant="ghost"
          size="sm"
          onClick={() => {
            const url = window.prompt('Enter link URL:');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          className={`p-1 h-8 w-8 ${editor.isActive('link') ? 'bg-accent/30' : ''}`}
          title="Insert Link"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost"
          size="sm"
          onClick={() => {
            const url = window.prompt('Enter image URL:');
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          }}
          className="p-1 h-8 w-8"
          title="Insert Image"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={`p-1 h-8 w-8 ${editor.isActive('taskList') ? 'bg-accent/30' : ''}`}
          title="Insert Checklist"
        >
          <CheckSquare className="h-4 w-4" />
        </Button>
        
        <div className="h-5 w-px bg-gray-600"></div>
        
        <Button 
          variant="ghost"
          size="sm"
          className="p-1 h-8 w-8"
          title="More Options"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
      
      <EditorContent editor={editor} />
    </div>
  );
}
