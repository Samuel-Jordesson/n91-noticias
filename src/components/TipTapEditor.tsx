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
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight
} from "lucide-react";
import { useRef, useEffect } from "react";

interface TipTapEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  showToolbar?: boolean;
  toolbarPosition?: 'top' | 'inline';
  onEditorReady?: (editor: any) => void;
  renderToolbar?: (toolbar: React.ReactNode) => React.ReactNode;
}

const TipTapEditor = ({ content = "", onChange, placeholder = "Escreva o conteúdo da matéria...", showToolbar = true, toolbarPosition = 'inline', onEditorReady, renderToolbar }: TipTapEditorProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extensão de imagem customizada com redimensionamento
  const ResizableImageExtension = Image.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        width: {
          default: null,
          parseHTML: element => {
            const width = element.getAttribute('width');
            if (width) return parseInt(width);
            const styleWidth = element.style.width;
            if (styleWidth) {
              const parsed = parseInt(styleWidth.replace('px', ''));
              return isNaN(parsed) ? null : parsed;
            }
            return null;
          },
          renderHTML: attributes => {
            if (attributes.width) {
              const styleParts = [`width: ${attributes.width}px`];
              if (attributes.height) {
                styleParts.push(`height: ${attributes.height}px`);
              } else {
                styleParts.push('height: auto');
              }
              return {
                width: attributes.width,
                style: styleParts.join('; '),
              };
            }
            return {};
          },
        },
        height: {
          default: null,
          parseHTML: element => {
            const height = element.getAttribute('height');
            if (height) return parseInt(height);
            const styleHeight = element.style.height;
            if (styleHeight) {
              const parsed = parseInt(styleHeight.replace('px', ''));
              return isNaN(parsed) ? null : parsed;
            }
            return null;
          },
          renderHTML: attributes => {
            if (attributes.height && !attributes.width) {
              return {
                height: attributes.height,
                style: `height: ${attributes.height}px; width: auto;`,
              };
            }
            return {};
          },
        },
        align: {
          default: 'left',
          parseHTML: element => {
            // Tentar pegar do data-align ou do wrapper pai
            const wrapper = element.closest('[data-align]');
            return wrapper?.getAttribute('data-align') || element.getAttribute('data-align') || 'left';
          },
          renderHTML: attributes => {
            return {
              'data-align': attributes.align || 'left',
            };
          },
        },
      };
    },
    addNodeView() {
      return ({ node, HTMLAttributes, getPos, editor }) => {
        const dom = document.createElement('div');
        dom.className = 'resizable-image-wrapper relative inline-block my-4';
        dom.style.userSelect = 'none';
        
        // Aplicar alinhamento inicial
        const alignment = node.attrs.align || 'left';
        if (alignment === 'center') {
          dom.style.display = 'block';
          dom.style.marginLeft = 'auto';
          dom.style.marginRight = 'auto';
        } else if (alignment === 'right') {
          dom.style.display = 'block';
          dom.style.marginLeft = 'auto';
          dom.style.marginRight = '0';
        } else {
          dom.style.display = 'block';
          dom.style.marginLeft = '0';
          dom.style.marginRight = 'auto';
        }
        
        const img = document.createElement('img');
        img.src = node.attrs.src;
        img.alt = node.attrs.alt || '';
        img.className = 'rounded-lg';
        img.style.display = 'block';
        img.draggable = false;
        img.style.objectFit = 'contain';
        
        // Aplicar tamanhos iniciais
        if (node.attrs.width) {
          img.style.width = `${node.attrs.width}px`;
        } else {
          img.style.width = 'auto';
        }
        if (node.attrs.height) {
          img.style.height = `${node.attrs.height}px`;
        } else {
          img.style.height = 'auto';
        }
        
        dom.appendChild(img);
        
        let resizeHandle: HTMLDivElement | null = null;
        let isResizing = false;
        let startX = 0;
        let startWidth = 0;
        let startHeight = 0;
        let currentWidth = 0;
        let currentHeight = 0;
        
        // Aguardar imagem carregar para pegar dimensões naturais
        img.onload = () => {
          if (!node.attrs.width && !node.attrs.height) {
            currentWidth = img.naturalWidth;
            currentHeight = img.naturalHeight;
            img.style.width = `${currentWidth}px`;
            img.style.height = `${currentHeight}px`;
          } else {
            currentWidth = node.attrs.width || img.naturalWidth;
            currentHeight = node.attrs.height || img.naturalHeight;
          }
        };
        
        if (img.complete) {
          currentWidth = node.attrs.width || img.naturalWidth || img.offsetWidth || 500;
          currentHeight = node.attrs.height || img.naturalHeight || img.offsetHeight || 300;
        }
        
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
          resizeHandle.className = 'resize-handle absolute w-4 h-4 bg-primary cursor-nwse-resize rounded-tl-lg border-2 border-background z-10';
          resizeHandle.style.position = 'absolute';
          resizeHandle.style.bottom = '-2px';
          resizeHandle.style.right = '-2px';
          resizeHandle.style.pointerEvents = 'auto';
          resizeHandle.title = 'Arraste para redimensionar';
          
          resizeHandle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            isResizing = true;
            startX = e.clientX;
            
            // Pegar dimensões atuais da imagem
            const rect = img.getBoundingClientRect();
            startWidth = rect.width;
            startHeight = rect.height;
            currentWidth = startWidth;
            currentHeight = startHeight;
            
            // Prevenir seleção de texto e scroll
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'nwse-resize';
            document.body.style.overflow = 'hidden';
            
            // Desabilitar atualizações do editor durante o resize
            const originalUpdate = editor.view.dispatch;
            let updateBlocked = false;
            
            const handleMouseMove = (e: MouseEvent) => {
              if (!isResizing) return;
              
              e.preventDefault();
              e.stopPropagation();
              e.stopImmediatePropagation();
              
              // Bloquear atualizações do editor temporariamente
              updateBlocked = true;
              
              // Calcular diferença do mouse
              const diff = e.clientX - startX;
              
              // Calcular novo tamanho
              let newWidth = startWidth + diff;
              
              // Limitar tamanho (mínimo 100px, máximo 1200px)
              newWidth = Math.max(100, Math.min(1200, newWidth));
              
              // Manter proporção
              const aspectRatio = startHeight / startWidth;
              const newHeight = newWidth * aspectRatio;
              
              // Atualizar dimensões atuais
              currentWidth = newWidth;
              currentHeight = newHeight;
              
              // Atualizar visualmente IMEDIATAMENTE (sem atualizar o editor ainda)
              img.style.width = `${newWidth}px`;
              img.style.height = `${newHeight}px`;
              img.style.maxWidth = 'none';
              img.style.maxHeight = 'none';
              
              // Permitir atualizações novamente
              updateBlocked = false;
            };
            
            const handleMouseUp = (e: MouseEvent) => {
              if (!isResizing) return;
              
              e.preventDefault();
              e.stopPropagation();
              
              isResizing = false;
              document.body.style.userSelect = '';
              document.body.style.cursor = '';
              document.body.style.overflow = '';
              
              // Restaurar max-width
              img.style.maxWidth = '100%';
              
              // Salvar tamanho final no editor APENAS quando soltar
              updateImageSize(Math.round(currentWidth), Math.round(currentHeight));
              
              // Remover listeners
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };
            
            // Adicionar listeners no document com capture para garantir captura
            document.addEventListener('mousemove', handleMouseMove, { capture: true, passive: false });
            document.addEventListener('mouseup', handleMouseUp, { capture: true, once: true });
          });
          
          dom.appendChild(resizeHandle);
        };
        
        const removeResizeHandle = () => {
          if (resizeHandle) {
            resizeHandle.remove();
            resizeHandle = null;
          }
        };
        
        // Verificar seleção
        const checkSelection = () => {
          if (isResizing) return;
          
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
        
        // Configurar listener de seleção
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

  const setAlignment = (alignment: 'left' | 'center' | 'right') => {
    // Aplicar alinhamento usando CSS inline
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    
    // Encontrar o elemento de bloco mais próximo
    let element: HTMLElement | null = null;
    if (container.nodeType === Node.TEXT_NODE) {
      element = container.parentElement;
    } else if (container.nodeType === Node.ELEMENT_NODE) {
      element = container as HTMLElement;
    }
    
    // Encontrar o parágrafo ou div mais próximo
    while (element && !['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(element.tagName)) {
      element = element.parentElement;
    }
    
    if (element) {
      element.style.textAlign = alignment;
    }
  };

  const alignImage = (alignment: 'left' | 'center' | 'right') => {
    const { from, to } = editor.state.selection;
    
    // Encontrar a imagem na seleção
    editor.chain().focus().command(({ tr, state }) => {
      state.doc.nodesBetween(from, to, (node, pos) => {
        if (node.type.name === 'image') {
          // Atualizar atributo de alinhamento
          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            align: alignment,
          });
          
          // Atualizar visualmente o wrapper
          setTimeout(() => {
            const editorElement = document.querySelector('.ProseMirror');
            if (editorElement) {
              // Encontrar o wrapper específico desta imagem
              const allWrappers = editorElement.querySelectorAll('.resizable-image-wrapper');
              allWrappers.forEach((wrapper, index) => {
                // Verificar se este wrapper contém a imagem que estamos procurando
                const img = wrapper.querySelector('img');
                if (img && img.src === node.attrs.src) {
                  const wrapperEl = wrapper as HTMLElement;
                  if (alignment === 'center') {
                    wrapperEl.style.display = 'block';
                    wrapperEl.style.marginLeft = 'auto';
                    wrapperEl.style.marginRight = 'auto';
                    wrapperEl.style.width = 'fit-content';
                  } else if (alignment === 'right') {
                    wrapperEl.style.display = 'block';
                    wrapperEl.style.marginLeft = 'auto';
                    wrapperEl.style.marginRight = '0';
                    wrapperEl.style.width = 'fit-content';
                  } else {
                    wrapperEl.style.display = 'block';
                    wrapperEl.style.marginLeft = '0';
                    wrapperEl.style.marginRight = 'auto';
                    wrapperEl.style.width = 'fit-content';
                  }
                }
              });
            }
          }, 10);
        }
      });
      return true;
    }).run();
  };

  const toolbar = (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-muted/50 rounded-t-lg">
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

        {/* Alignment */}
        <div className="flex items-center gap-1 pr-2 border-r border-border">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              const { from, to } = editor.state.selection;
              const node = editor.state.doc.nodeAt(from);
              if (node?.type.name === 'image') {
                alignImage('left');
              } else {
                setAlignment('left');
              }
            }}
            title="Alinhar à esquerda"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              const { from, to } = editor.state.selection;
              const node = editor.state.doc.nodeAt(from);
              if (node?.type.name === 'image') {
                alignImage('center');
              } else {
                setAlignment('center');
              }
            }}
            title="Centralizar"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              const { from, to } = editor.state.selection;
              const node = editor.state.doc.nodeAt(from);
              if (node?.type.name === 'image') {
                alignImage('right');
              } else {
                setAlignment('right');
              }
            }}
            title="Alinhar à direita"
          >
            <AlignRight className="h-4 w-4" />
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
    </div>
  );

  // Se não mostrar toolbar, retornar apenas o editor
  if (!showToolbar) {
    return (
      <div className="rounded-lg overflow-hidden bg-card">
        <EditorContent editor={editor} />
      </div>
    );
  }

  // Se toolbar no topo, retornar toolbar separada e editor
  if (toolbarPosition === 'top') {
    if (renderToolbar) {
      return (
        <>
          {renderToolbar(toolbar)}
          <div className="rounded-lg overflow-hidden bg-card">
            <EditorContent editor={editor} />
          </div>
        </>
      );
    }
    return (
      <>
        {toolbar}
        <div className="rounded-lg overflow-hidden bg-card">
          <EditorContent editor={editor} />
        </div>
      </>
    );
  }

  // Padrão: toolbar inline
  return (
    <div className="rounded-lg overflow-hidden bg-card">
      {toolbar}
      <EditorContent editor={editor} />
    </div>
  );
};

export default TipTapEditor;
