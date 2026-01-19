import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  Code
} from "lucide-react";
import { useRef, useEffect } from "react";

interface TipTapEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
}

const TipTapEditor = ({ content = "", onChange, placeholder = "Escreva o conteúdo da matéria..." }: TipTapEditorProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extensão de imagem customizada com redimensionamento
  const ResizableImageExtension = Image.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        width: {
          default: null,
        },
        height: {
          default: null,
        },
      };
    },
    addNodeView() {
      return ({ node, HTMLAttributes, getPos, editor }) => {
        const dom = document.createElement('div');
        dom.className = 'resizable-image-wrapper relative inline-block my-4';
        dom.style.userSelect = 'none';
        
        const img = document.createElement('img');
        img.src = node.attrs.src;
        img.alt = node.attrs.alt || '';
        img.className = 'rounded-lg max-w-full';
        img.style.display = 'block';
        img.draggable = false;
        
        if (node.attrs.width) {
          img.style.width = `${node.attrs.width}px`;
        }
        if (node.attrs.height) {
          img.style.height = `${node.attrs.height}px`;
        }
        
        dom.appendChild(img);
        
        let resizeHandle: HTMLDivElement | null = null;
        let isResizing = false;
        let startX = 0;
        let startWidth = 0;
        let startHeight = 0;
        
        const updateImageSize = (newWidth: number, newHeight: number) => {
          const pos = getPos();
          if (typeof pos === 'number') {
            editor.commands.updateAttributes('image', {
              width: newWidth,
              height: newHeight,
            });
          }
        };
        
        const addResizeHandle = () => {
          if (resizeHandle) return;
          
          resizeHandle = document.createElement('div');
          resizeHandle.className = 'resize-handle absolute bottom-0 right-0 w-4 h-4 bg-primary cursor-nwse-resize rounded-tl-lg border-2 border-background z-10';
          resizeHandle.style.transform = 'translate(50%, 50%)';
          resizeHandle.style.pointerEvents = 'auto';
          resizeHandle.title = 'Arraste para redimensionar';
          
          resizeHandle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            isResizing = true;
            startX = e.clientX;
            startWidth = img.offsetWidth || img.naturalWidth || 500;
            startHeight = img.offsetHeight || img.naturalHeight || 300;
            
            // Prevenir seleção de texto durante o redimensionamento
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'nwse-resize';
            
            const handleMouseMove = (e: MouseEvent) => {
              if (!isResizing) return;
              
              e.preventDefault();
              e.stopPropagation();
              
              // Calcular nova largura baseada na diferença do mouse
              const diff = e.clientX - startX;
              let newWidth = startWidth + diff;
              
              // Limitar tamanho
              newWidth = Math.max(100, Math.min(1200, newWidth));
              
              // Calcular altura mantendo proporção
              const aspectRatio = startHeight / startWidth;
              const newHeight = newWidth * aspectRatio;
              
              // Atualizar visualmente IMEDIATAMENTE (sem RAF para resposta instantânea)
              img.style.width = `${newWidth}px`;
              img.style.height = `${newHeight}px`;
              img.style.maxWidth = 'none'; // Remover max-width durante resize
              
              // Atualizar no editor (de forma assíncrona para não bloquear)
              setTimeout(() => {
                updateImageSize(newWidth, newHeight);
              }, 0);
            };
            
            const handleMouseUp = (e: MouseEvent) => {
              if (!isResizing) return;
              
              e.preventDefault();
              e.stopPropagation();
              
              isResizing = false;
              document.body.style.userSelect = '';
              document.body.style.cursor = '';
              
              // Restaurar max-width
              img.style.maxWidth = '100%';
              
              // Atualização final imediata
              const finalWidth = parseInt(img.style.width) || img.offsetWidth;
              const finalHeight = parseInt(img.style.height) || img.offsetHeight;
              updateImageSize(finalWidth, finalHeight);
              
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };
            
            // Adicionar listeners no document para capturar movimento mesmo fora da imagem
            document.addEventListener('mousemove', handleMouseMove, { passive: false });
            document.addEventListener('mouseup', handleMouseUp, { once: true });
          });
          
          dom.appendChild(resizeHandle);
        };
        
        const removeResizeHandle = () => {
          if (resizeHandle) {
            resizeHandle.remove();
            resizeHandle = null;
          }
        };
        
        // Adicionar handle quando a imagem estiver selecionada
        const checkSelection = () => {
          if (isResizing) return; // Não atualizar durante o redimensionamento
          
          const pos = getPos();
          if (typeof pos === 'number') {
            const { from, to } = editor.state.selection;
            const isSelected = from <= pos + node.nodeSize && to >= pos;
            
            if (isSelected && !resizeHandle) {
              addResizeHandle();
            } else if (!isSelected && resizeHandle) {
              removeResizeHandle();
            }
          }
        };
        
        // Usar setTimeout para garantir que o editor está pronto
        setTimeout(() => {
          editor.on('selectionUpdate', checkSelection);
          checkSelection();
        }, 0);
        
        return {
          dom,
          contentDOM: null,
        };
      };
    },
  }).configure({
    HTMLAttributes: {
      class: "rounded-lg max-w-full h-auto my-4",
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      ResizableImageExtension,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[300px] p-4",
      },
    },
  });

  // Atualizar o conteúdo do editor quando a prop content mudar
  useEffect(() => {
    if (editor && content !== undefined) {
      const currentContent = editor.getHTML();
      // Só atualiza se o conteúdo for diferente para evitar loops
      if (currentContent !== content) {
        editor.commands.setContent(content || "");
      }
    }
  }, [editor, content]);

  if (!editor) {
    return null;
  }

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        editor.chain().focus().setImage({ src: imageUrl }).run();
      };
      reader.readAsDataURL(file);
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL do link:", previousUrl);

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-muted/50">
        {/* Text Formatting */}
        <div className="flex items-center gap-1 pr-2 border-r border-border">
          <Button
            type="button"
            variant={editor.isActive("bold") ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Negrito"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive("italic") ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Itálico"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive("strike") ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Riscado"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive("code") ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().toggleCode().run()}
            title="Código"
          >
            <Code className="h-4 w-4" />
          </Button>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-1 pr-2 border-r border-border">
          <Button
            type="button"
            variant={editor.isActive("heading", { level: 1 }) ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            title="Título 1"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Título 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive("heading", { level: 3 }) ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            title="Título 3"
          >
            <Heading3 className="h-4 w-4" />
          </Button>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 pr-2 border-r border-border">
          <Button
            type="button"
            variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Lista"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Lista Numerada"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive("blockquote") ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Citação"
          >
            <Quote className="h-4 w-4" />
          </Button>
        </div>

        {/* Media */}
        <div className="flex items-center gap-1 pr-2 border-r border-border">
          <Button
            type="button"
            variant={editor.isActive("link") ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={setLink}
            title="Adicionar Link"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleImageUpload}
            title="Adicionar Imagem"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Linha Horizontal"
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>

        {/* History */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Desfazer"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Refazer"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Editor Content */}
      <EditorContent editor={editor} />
    </div>
  );
};

export default TipTapEditor;
