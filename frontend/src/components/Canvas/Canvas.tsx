import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Panel,
  MarkerType,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  type NodeTypes,
  type OnNodeDrag,
  type OnSelectionChangeFunc,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import CardNodeComponent from '../Card/CardNode';
import TextLabelNodeComponent from '../Card/TextLabelNode';
import CardEditor from '../Card/CardEditor';
import ModeToggle from './ModeToggle';
import LayoutToggle from './LayoutToggle';
import LeftMenu from '../LeftMenu/LeftMenu';
import { useBoardMode } from '../../hooks/useBoardMode';
import { useCreateCard, useUpdateCard, useDeleteCard, useBatchUpdatePositions, useAddAttachment } from '../../hooks/useCards';
import { useCreateConnection, useDeleteConnection } from '../../hooks/useConnections';
import { uploadFile } from '../../api/uploads';
import { getLayoutedElements } from '../../utils/layout';
import { useTheme } from '../../hooks/useTheme';
import { useUndoRedo } from '../../hooks/useUndoRedo';
import type { CardData, ArrowSettings, CardTemplate } from '../../types';

const nodeTypes: NodeTypes = {
  card: CardNodeComponent,
  text_label: TextLabelNodeComponent,
};

interface CanvasProps {
  boardId: string;
  cards: CardData[];
  connections: {
    id: string;
    board_id: string;
    source_card_id: string;
    target_card_id: string;
    direction: string;
    style: { color: string; stroke_width: number; line_type: string };
    created_at: string;
  }[];
}

export default function Canvas({ boardId, cards, connections }: CanvasProps) {
  const { mode } = useBoardMode();
  const { theme } = useTheme();
  const isEdit = mode === 'edit';

  const [editingCard, setEditingCard] = useState<CardData | null>(null);
  const [isAutoLayout, setIsAutoLayout] = useState(false);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);

  const [arrowSettings, setArrowSettings] = useState<ArrowSettings>({
    direction: 'forward',
    style: { color: '#555555', stroke_width: 2, line_type: 'solid' },
  });

  const [cardTemplate, setCardTemplate] = useState<CardTemplate>({
    color: '#FFF9C4',
    text_color: '#000000',
    font_size: 14,
  });

  const createCard = useCreateCard(boardId);
  const updateCard = useUpdateCard(boardId);
  const deleteCard = useDeleteCard(boardId);
  const batchUpdatePositions = useBatchUpdatePositions(boardId);
  const addAttachment = useAddAttachment(boardId);
  const createConnection = useCreateConnection(boardId);
  const deleteConnection = useDeleteConnection(boardId);

  const { pushAction, undo, redo, canUndo, canRedo, setCallbacks } = useUndoRedo();

  // Use refs for callbacks passed into node data to avoid infinite re-render loops
  const deleteCardRef = useRef(deleteCard);
  deleteCardRef.current = deleteCard;
  const updateCardRef = useRef(updateCard);
  updateCardRef.current = updateCard;
  const createCardRef = useRef(createCard);
  createCardRef.current = createCard;

  // Keep undo/redo callbacks in sync
  const cardsRef = useRef(cards);
  cardsRef.current = cards;

  useEffect(() => {
    setCallbacks({
      updateCard: (cardId, updates) => {
        updateCardRef.current.mutate({ cardId, updates: updates as Partial<CardData> });
      },
      createCard: async (data) => {
        return await createCardRef.current.mutateAsync(data as Partial<CardData>);
      },
      deleteCard: (cardId) => {
        deleteCardRef.current.mutate(cardId);
      },
    });
  }, [setCallbacks]);

  const dragStartPos = useRef<{ [id: string]: { x: number; y: number } }>({});

  const pushActionRef = useRef(pushAction);
  pushActionRef.current = pushAction;

  const handleDeleteCard = useCallback((cardId: string) => {
    if (confirm('Delete this card?')) {
      const card = cardsRef.current.find((c) => c.id === cardId);
      if (card) {
        pushActionRef.current({
          type: 'delete',
          cardId: card.id,
          cardData: {
            title: card.title,
            content: card.content,
            color: card.color,
            text_color: card.text_color,
            font_size: card.font_size,
            position: card.position,
            size: card.size,
            card_type: card.card_type,
          },
        });
      }
      deleteCardRef.current.mutate(cardId);
    }
  }, []);

  const handleEditCard = useCallback((card: CardData) => {
    if (card.card_type === 'text_label') {
      updateCardRef.current.mutate({ cardId: card.id, updates: { content: card.content } as Partial<CardData> });
    } else {
      setEditingCard(card);
    }
  }, []);

  const handleResizeCard = useCallback((cardId: string, width: number, height: number) => {
    updateCardRef.current.mutate({
      cardId,
      updates: { size: { width, height } } as Partial<CardData>,
    });
  }, []);

  // Build nodes only when cards change (callbacks are stable via refs)
  const cardsKey = useMemo(() => JSON.stringify(cards), [cards]);
  const builtNodes: Node[] = useMemo(
    () =>
      cards.map((card) => ({
        id: card.id,
        type: card.card_type === 'text_label' ? 'text_label' : 'card',
        position: card.position,
        data: {
          card,
          onDelete: handleDeleteCard,
          onEdit: handleEditCard,
          onResize: handleResizeCard,
        },
        style: { width: card.size.width, height: card.size.height },
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cardsKey]
  );

  const connectionsKey = useMemo(() => JSON.stringify(connections), [connections]);
  const builtEdges: Edge[] = useMemo(
    () =>
      connections.map((conn) => {
        const dashArray =
          conn.style.line_type === 'dashed'
            ? '8 4'
            : conn.style.line_type === 'dotted'
              ? '2 2'
              : undefined;

        const markerEnd =
          conn.direction === 'reverse'
            ? undefined
            : { type: MarkerType.ArrowClosed, color: conn.style.color };

        const markerStart =
          conn.direction === 'reverse' || conn.direction === 'both'
            ? { type: MarkerType.ArrowClosed, color: conn.style.color }
            : undefined;

        return {
          id: conn.id,
          source: conn.source_card_id,
          target: conn.target_card_id,
          type: 'smoothstep',
          markerEnd,
          markerStart,
          style: {
            stroke: conn.style.color,
            strokeWidth: conn.style.stroke_width,
            strokeDasharray: dashArray,
          },
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [connectionsKey]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Sync when server data changes
  useEffect(() => {
    setNodes(builtNodes);
  }, [builtNodes, setNodes]);

  useEffect(() => {
    setEdges(builtEdges);
  }, [builtEdges, setEdges]);

  const arrowSettingsRef = useRef(arrowSettings);
  arrowSettingsRef.current = arrowSettings;

  const createConnectionRef = useRef(createConnection);
  createConnectionRef.current = createConnection;

  const deleteConnectionRef = useRef(deleteConnection);
  deleteConnectionRef.current = deleteConnection;

  const isAutoLayoutRef = useRef(isAutoLayout);
  isAutoLayoutRef.current = isAutoLayout;

  const applyAutoLayout = useCallback(() => {
    setNodes((currentNodes) => {
      setEdges((currentEdges) => {
        const { nodes: layoutedNodes } = getLayoutedElements(currentNodes, currentEdges);
        batchUpdatePositions.mutate(
          layoutedNodes.map((n) => ({ id: n.id, position: n.position }))
        );
        setNodes(layoutedNodes);
        return currentEdges;
      });
      return currentNodes;
    });
  }, [setNodes, setEdges, batchUpdatePositions]);

  const applyAutoLayoutRef = useRef(applyAutoLayout);
  applyAutoLayoutRef.current = applyAutoLayout;

  const onNodeDragStart: OnNodeDrag = useCallback((_event, node) => {
    dragStartPos.current[node.id] = { ...node.position };
  }, []);

  const onNodeDragStop: OnNodeDrag = useCallback((_event, node) => {
    const oldPos = dragStartPos.current[node.id];
    if (oldPos) {
      pushActionRef.current({
        type: 'move',
        cardId: node.id,
        oldPosition: oldPos,
        newPosition: { ...node.position },
      });
      delete dragStartPos.current[node.id];
    }
    updateCardRef.current.mutate({
      cardId: node.id,
      updates: { position: node.position } as Partial<CardData>,
    });
  }, []);

  const onConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) return;
    if (connection.source === connection.target) return;
    createConnectionRef.current.mutate({
      sourceCardId: connection.source,
      targetCardId: connection.target,
      direction: arrowSettingsRef.current.direction,
      style: arrowSettingsRef.current.style,
    });
    if (isAutoLayoutRef.current) {
      setTimeout(() => applyAutoLayoutRef.current(), 100);
    }
  }, []);

  const onSelectionChange: OnSelectionChangeFunc = useCallback(({ nodes: selectedNodes }) => {
    setSelectedNodeIds(selectedNodes.map((n) => n.id));
  }, []);

  const handleColorChange = useCallback((color: string) => {
    selectedNodeIds.forEach((nodeId) => {
      const card = cardsRef.current.find((c) => c.id === nodeId);
      if (card) {
        pushAction({ type: 'color', cardId: nodeId, oldColor: card.color, newColor: color });
      }
      updateCardRef.current.mutate({
        cardId: nodeId,
        updates: { color } as Partial<CardData>,
      });
    });
  }, [selectedNodeIds, pushAction]);

  const handleTextColorChange = useCallback((textColor: string) => {
    selectedNodeIds.forEach((nodeId) => {
      updateCardRef.current.mutate({
        cardId: nodeId,
        updates: { text_color: textColor } as Partial<CardData>,
      });
    });
  }, [selectedNodeIds]);

  const onEdgesDelete = useCallback((deletedEdges: Edge[]) => {
    deletedEdges.forEach((edge) => {
      deleteConnectionRef.current.mutate(edge.id);
    });
  }, []);

  const handleToggleAutoLayout = useCallback(() => {
    setIsAutoLayout((prev) => !prev);
  }, []);

  const handleCreateCard = useCallback(() => {
    createCard.mutateAsync({
      title: '',
      content: '',
      color: cardTemplate.color,
      text_color: cardTemplate.text_color,
      font_size: cardTemplate.font_size,
      position: { x: 200 + Math.random() * 200, y: 200 + Math.random() * 200 },
      size: { width: 200, height: 150 },
      card_type: 'card',
    } as Partial<CardData>).then((newCard) => {
      pushAction({
        type: 'create',
        cardId: newCard.id,
        cardData: {
          title: newCard.title,
          content: newCard.content,
          color: newCard.color,
          text_color: newCard.text_color,
          font_size: newCard.font_size,
          position: newCard.position,
          size: newCard.size,
          card_type: newCard.card_type,
        },
      });
      if (isAutoLayoutRef.current) {
        setTimeout(applyAutoLayout, 100);
      }
    });
  }, [createCard, cardTemplate, pushAction, applyAutoLayout]);

  const handleUpload = useCallback(
    async (files: FileList) => {
      for (const file of Array.from(files)) {
        const result = await uploadFile(file);
        const card = await createCard.mutateAsync({
          title: file.name,
          content: '',
          color: cardTemplate.color,
          text_color: cardTemplate.text_color,
          font_size: cardTemplate.font_size,
          position: { x: 200 + Math.random() * 200, y: 200 + Math.random() * 200 },
          size: { width: 220, height: 200 },
        } as Partial<CardData>);
        await addAttachment.mutateAsync({
          cardId: card.id,
          attachment: result,
        });
      }
    },
    [createCard, addAttachment, cardTemplate]
  );

  const handleCanvasDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();
      if (!isEdit) return;
      const files = event.dataTransfer.files;
      if (files.length > 0) {
        await handleUpload(files);
      }
    },
    [isEdit, handleUpload]
  );

  const handleCanvasDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isEdit) return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) {
        e.preventDefault();
        redo();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEdit, undo, redo]);

  return (
    <div
      className={!isEdit ? 'view-mode' : ''}
      style={{ width: '100%', height: '100%' }}
      onDrop={handleCanvasDrop}
      onDragOver={handleCanvasDragOver}
    >
      <LeftMenu
        arrowSettings={arrowSettings}
        onArrowSettingsChange={setArrowSettings}
        cardTemplate={cardTemplate}
        onCardTemplateChange={setCardTemplate}
        onCreateCard={handleCreateCard}
        onUpload={handleUpload}
        onColorChange={selectedNodeIds.length > 0 ? handleColorChange : undefined}
        onTextColorChange={selectedNodeIds.length > 0 ? handleTextColorChange : undefined}
      />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        style={{ background: theme === 'dark' ? '#1a1a2e' : '#fafafa' }}
        onNodesChange={isEdit ? onNodesChange : undefined}
        onEdgesChange={isEdit ? onEdgesChange : undefined}
        onConnect={isEdit ? onConnect : undefined}
        onNodeDragStart={isEdit ? onNodeDragStart : undefined}
        onNodeDragStop={isEdit ? onNodeDragStop : undefined}
        onEdgesDelete={isEdit ? onEdgesDelete : undefined}
        onSelectionChange={onSelectionChange}
        nodesDraggable={isEdit}
        nodesConnectable={isEdit}
        elementsSelectable={isEdit}
        fitView
        deleteKeyCode={isEdit ? 'Delete' : null}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color={theme === 'dark' ? '#333' : '#ddd'} />
        <Controls />
        <Panel position="top-right">
          <div style={{ display: 'flex', gap: 8 }}>
            {isEdit && (
              <>
                <button
                  className="panel-btn"
                  onClick={undo}
                  disabled={!canUndo}
                  title="Undo (Ctrl+Z)"
                  style={{ opacity: canUndo ? 1 : 0.4 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  </svg>
                </button>
                <button
                  className="panel-btn"
                  onClick={redo}
                  disabled={!canRedo}
                  title="Redo (Ctrl+Shift+Z)"
                  style={{ opacity: canRedo ? 1 : 0.4 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10" />
                  </svg>
                </button>
              </>
            )}
            {isEdit && (
              <LayoutToggle isAutoLayout={isAutoLayout} onToggle={handleToggleAutoLayout} />
            )}
            <ModeToggle />
          </div>
        </Panel>
        {nodes.length === 0 && isEdit && (
          <Panel position="top-center">
            <div style={{
              marginTop: '30vh',
              textAlign: 'center',
              color: 'var(--text-muted)',
              animation: 'fadeIn 0.5s ease',
            }}>
              <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.5 }}>
                {'\uD83D\uDCA1'}
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>
                Start organizing your thoughts
              </div>
              <div style={{ fontSize: 14, marginBottom: 16 }}>
                Open the menu to create your first card, or drag an image onto the canvas
              </div>
              <button
                onClick={handleCreateCard}
                style={{
                  padding: '10px 24px',
                  background: '#2196F3',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 14,
                  boxShadow: '0 2px 8px rgba(33, 150, 243, 0.3)',
                }}
              >
                + Create First Card
              </button>
            </div>
          </Panel>
        )}
      </ReactFlow>

      {editingCard && (
        <CardEditor
          card={editingCard}
          onSave={(updates) => {
            updateCard.mutate({ cardId: editingCard.id, updates });
          }}
          onDelete={() => {
            deleteCard.mutate(editingCard.id);
            setEditingCard(null);
          }}
          onClose={() => setEditingCard(null)}
        />
      )}
    </div>
  );
}
