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
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import CardNodeComponent from '../Card/CardNode';
import CardEditor from '../Card/CardEditor';
import ModeToggle from './ModeToggle';
import LayoutToggle from './LayoutToggle';
import LeftMenu from '../LeftMenu/LeftMenu';
import { useBoardMode } from '../../hooks/useBoardMode';
import { useCreateCard, useUpdateCard, useDeleteCard, useBatchUpdatePositions, useAddAttachment } from '../../hooks/useCards';
import { useCreateConnection, useDeleteConnection } from '../../hooks/useConnections';
import { uploadFile } from '../../api/uploads';
import { getLayoutedElements } from '../../utils/layout';
import type { CardData, ArrowSettings, CardTemplate } from '../../types';

const nodeTypes: NodeTypes = {
  card: CardNodeComponent,
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
  const isEdit = mode === 'edit';

  const [editingCard, setEditingCard] = useState<CardData | null>(null);
  const [isAutoLayout, setIsAutoLayout] = useState(false);

  const [arrowSettings, setArrowSettings] = useState<ArrowSettings>({
    direction: 'forward',
    style: { color: '#555555', stroke_width: 2, line_type: 'solid' },
  });

  const [cardTemplate, setCardTemplate] = useState<CardTemplate>({
    color: '#FFEB3B',
    font_size: 14,
  });

  const createCard = useCreateCard(boardId);
  const updateCard = useUpdateCard(boardId);
  const deleteCard = useDeleteCard(boardId);
  const batchUpdatePositions = useBatchUpdatePositions(boardId);
  const addAttachment = useAddAttachment(boardId);
  const createConnection = useCreateConnection(boardId);
  const deleteConnection = useDeleteConnection(boardId);

  // Use refs for callbacks passed into node data to avoid infinite re-render loops
  const deleteCardRef = useRef(deleteCard);
  deleteCardRef.current = deleteCard;
  const updateCardRef = useRef(updateCard);
  updateCardRef.current = updateCard;

  const handleDeleteCard = useCallback((cardId: string) => {
    if (confirm('Delete this card?')) {
      deleteCardRef.current.mutate(cardId);
    }
  }, []);

  const handleEditCard = useCallback((card: CardData) => {
    setEditingCard(card);
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
        type: 'card' as const,
        position: card.position,
        data: {
          card,
          onDelete: handleDeleteCard,
          onEdit: handleEditCard,
          onResize: handleResizeCard,
        },
        style: { width: card.size.width, height: card.size.height },
        dragHandle: '.card-node__header',
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

  const onNodeDragStop: OnNodeDrag = useCallback((_event, node) => {
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
  }, []);

  const onEdgesDelete = useCallback((deletedEdges: Edge[]) => {
    deletedEdges.forEach((edge) => {
      deleteConnectionRef.current.mutate(edge.id);
    });
  }, []);

  const handleToggleAutoLayout = useCallback(() => {
    setIsAutoLayout((prev) => {
      const next = !prev;
      if (next) {
        setNodes((currentNodes) => {
          setEdges((currentEdges) => {
            const { nodes: layoutedNodes } = getLayoutedElements(currentNodes, currentEdges);
            batchUpdatePositions.mutate(
              layoutedNodes.map((n) => ({ id: n.id, position: n.position }))
            );
            // We set nodes inside setEdges callback just to read currentEdges;
            // return currentEdges unchanged
            setNodes(layoutedNodes);
            return currentEdges;
          });
          return currentNodes; // will be overwritten by inner setNodes
        });
      }
      return next;
    });
  }, [setNodes, setEdges, batchUpdatePositions]);

  const handleCreateCard = useCallback(() => {
    createCard.mutate({
      title: '',
      content: '',
      color: cardTemplate.color,
      font_size: cardTemplate.font_size,
      position: { x: 200 + Math.random() * 200, y: 200 + Math.random() * 200 },
      size: { width: 200, height: 150 },
    } as Partial<CardData>);
  }, [createCard, cardTemplate]);

  const handleUpload = useCallback(
    async (files: FileList) => {
      for (const file of Array.from(files)) {
        const result = await uploadFile(file);
        const card = await createCard.mutateAsync({
          title: file.name,
          content: '',
          color: cardTemplate.color,
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

  return (
    <div
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
      />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={isEdit ? onNodesChange : undefined}
        onEdgesChange={isEdit ? onEdgesChange : undefined}
        onConnect={isEdit ? onConnect : undefined}
        onNodeDragStop={isEdit ? onNodeDragStop : undefined}
        onEdgesDelete={isEdit ? onEdgesDelete : undefined}
        nodesDraggable={isEdit}
        nodesConnectable={isEdit}
        elementsSelectable={isEdit}
        fitView
        deleteKeyCode={isEdit ? 'Delete' : null}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#ddd" />
        <Controls />
        <Panel position="top-right">
          <div style={{ display: 'flex', gap: 8 }}>
            <LayoutToggle isAutoLayout={isAutoLayout} onToggle={handleToggleAutoLayout} />
            <ModeToggle />
          </div>
        </Panel>
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
