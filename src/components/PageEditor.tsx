import { KonvaEventObject, Node, NodeConfig } from 'konva/lib/Node';
import { FlipHorizontal2, FlipVertical2, Maximize, Redo2, RotateCcw, RotateCw, Undo2, ZoomIn, ZoomOut } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Circle, Image as KonvaImage, Layer, Line, Stage } from 'react-konva';
import { Page } from '../types';
import enhanceImage, { type EnhanceMode } from '../utils/imageProcessing/enhance';
import flip, { FlipType } from '../utils/imageProcessing/flip';
import { perspectiveTransform, type Point } from '../utils/imageProcessing/perspective';
import { rotateImage } from '../utils/imageProcessing/rotate';
import { Button, Select } from './ui';

interface Props {
  page: Page;
  onChange: (history: string[]) => void;
  updateHistory: (activeHistory: number) => void;
}

const enhanceOptions = [
  { label: 'Original', value: 'original' },
  { label: 'Grayscale', value: 'grayscale' },
  { label: 'Document', value: 'document' }
];

const PageEditor = ({ page, onChange, updateHistory }: Props) => {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [imageSize, setImageSize] = useState({ width: 600, height: 700 });
  const lastPos = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageScale, setStageScale] = useState(1);
  const [points, setPoints] = useState<Point[]>([
    { x: 80, y: 80 },
    { x: 520, y: 80 },
    { x: 520, y: 650 },
    { x: 80, y: 650 }
  ]);
  const [mode, setMode] = useState<EnhanceMode>('original');
  const zoomSteps = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3];

  useEffect(() => {
    if (!img || !containerRef.current) return;
    requestAnimationFrame(() => {
      const { width, height } = containerRef.current!.getBoundingClientRect();
      const scale = Math.min(width / imageSize.width, height / imageSize.height);
      setStageScale(scale);
    });
  }, [img, imageSize]);

  useEffect(() => {
    const imageElement = new window.Image();
    imageElement.onload = () => {
      setImg(imageElement);
      let width = imageElement.naturalWidth;
      let height = imageElement.naturalHeight;
      setImageSize({ width, height });
      setPointsOnChange(width, height);
    };
    imageElement.onerror = () => {
      console.error('Image load failed');
    };
    imageElement.src = page.history[page.activeHistory];
  }, [page]);

  const clampPoint = (point: Point): Point => {
    return { x: Math.max(0, Math.min(imageSize.width, point.x)), y: Math.max(0, Math.min(imageSize.height, point.y)) };
  };

  const updatePoint = (index: number, x: number, y: number) => {
    setPoints((prev) => prev.map((point, i) => (i === index ? clampPoint({ x, y }) : point)));
  };

  const setPointsOnChange = (width: number, height: number) => {
    setPoints([
      { x: width * 0.1, y: height * 0.1 },
      { x: width * 0.9, y: height * 0.1 },
      { x: width * 0.9, y: height * 0.9 },
      { x: width * 0.1, y: height * 0.9 }
    ]);
  };

  const onLineDrag = (e: KonvaEventObject<DragEvent, Node<NodeConfig>>, start: number, end: number) => {
    const currentX = e.target.x();
    const currentY = e.target.y();
    const dx = currentX - lastPos.current.x;
    const dy = currentY - lastPos.current.y;
    let mx = (start === 1 && end === 2) || (start === 3 && end === 0);
    let my = (start === 0 && end === 1) || (start === 2 && end === 3);

    setPoints((prev) => {
      const next = [...prev];
      next[start] = clampPoint({ x: next[start].x + (mx ? dx : 0), y: next[start].y + (my ? dy : 0) });
      next[end] = clampPoint({ x: next[end].x + (mx ? dx : 0), y: next[end].y + (my ? dy : 0) });

      return next;
    });
    lastPos.current = { x: currentX, y: currentY };
    e.target.position({ x: 0, y: 0 });
  };

  const getLineCursor = (start: number, end: number) => {
    return (start === 0 && end === 1) || (start === 2 && end === 3) ? 'ns-resize' : 'ew-resize';
  };

  const onAction = async (action: 'enhance' | 'rotate' | 'crop' | 'flip', value: EnhanceMode | number | Point[] | FlipType) => {
    if (action === 'enhance') {
      setMode(value as EnhanceMode);
    }

    if (!img) return;
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);
    let result: HTMLCanvasElement | null = null;
    if (action === 'enhance') {
      result = await enhanceImage(canvas, value as EnhanceMode);
    } else if (action === 'rotate') {
      result = await rotateImage(canvas, value as number);
    } else if (action === 'crop') {
      result = await perspectiveTransform(canvas, value as Point[]);
    } else if (action === 'flip') {
      result = await flip(canvas, value as FlipType);
    }
    if (result) {
      const newImage = result.toDataURL();
      const newImg = new Image();
      newImg.onload = () => {
        setImg(newImg);
        const width = newImg.width;
        const height = newImg.height;
        setImageSize({ width, height });
        setPointsOnChange(width, height);
        updateImage(newImage);
      };
      newImg.src = newImage;
    }
  };

  const updateImage = (newImage: string) => {
    const newHistory = page.history.slice(0, page.activeHistory + 1);
    newHistory.push(newImage);
    onChange(newHistory);
  };

  const undo = () => {
    if (page.activeHistory <= 0) return;
    const index = page.activeHistory - 1;
    updateHistory(index);
    const oldImage = page.history[index];
    const img = new Image();
    img.onload = () => {
      setImg(img);
    };
    img.src = oldImage;
  };

  const redo = () => {
    if (page.activeHistory >= page.history.length - 1) return;
    const index = page.activeHistory + 1;
    updateHistory(index);
    const newImage = page.history[index];
    const img = new Image();
    img.onload = () => {
      setImg(img);
    };
    img.src = newImage;
  };

  const zoomIn = () => {
    const nextIndex = zoomSteps.findIndex((value) => value > stageScale);
    if (nextIndex !== -1) {
      setStageScale(zoomSteps[nextIndex]);
    }
  };

  const zoomOut = () => {
    const previousIndex = [...zoomSteps].reverse().findIndex((value) => value < stageScale);
    if (previousIndex !== -1) {
      const actualIndex = zoomSteps.length - 1 - previousIndex;
      setStageScale(zoomSteps[actualIndex]);
    }
  };

  const resetZoom = () => {
    if (!img || !containerRef.current) return;
    requestAnimationFrame(() => {
      const { width, height } = containerRef.current!.getBoundingClientRect();
      const scale = Math.min(width / imageSize.width, height / imageSize.height);
      setStageScale(scale);
    });
  };

  return (
    <>
      {img && (
        <div className="flex h-full min-h-0 w-full flex-col gap-2 bg-calm-surface">
          <div className="flex w-full shrink-0 gap-2 border-b border-slate-200 p-3 shadow-soft">
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1 border-r border-slate-300 pr-3 justify-between h-full">
                <span className="text-sm font-medium text-center">Transform</span>
                <div className="flex gap-1">
                  <Button variant="outline" title="Rotate left" onClick={() => onAction('rotate', -90)}>
                    <RotateCcw size={18} />
                  </Button>
                  <Button variant="outline" title="Rotate right" onClick={() => onAction('rotate', 90)}>
                    <RotateCw size={18} />
                  </Button>
                  <Button variant="outline" title="Flip horizontal" onClick={() => onAction('flip', 'horizontal')}>
                    <FlipHorizontal2 size={18} />
                  </Button>
                  <Button variant="outline" title="Flip vertical" onClick={() => onAction('flip', 'vertical')}>
                    <FlipVertical2 size={18} />
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-1 border-r border-slate-300 pr-3 justify-between h-full">
                <span className="text-sm font-medium text-center">Enhance</span>
                <Select value={mode} options={enhanceOptions} onChange={(v) => onAction('enhance', v as EnhanceMode)} />
              </div>
              <div className="flex flex-col gap-1 border-r border-slate-300 pr-3 justify-between h-full">
                <span className="text-sm font-medium text-center">History</span>
                <div className="flex gap-1">
                  <Button variant="outline" disabled={page.activeHistory === 0 || page.history.length <= 1} onClick={undo}>
                    <Undo2 size={18} />
                  </Button>
                  <Button variant="outline" disabled={page.activeHistory === page.history.length - 1 || page.history.length <= 1} onClick={redo}>
                    <Redo2 size={18} />
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-1 border-r border-slate-300 pr-3 justify-between h-full">
                <span className="text-sm font-medium text-center">View</span>
                <div className="flex items-center gap-1">
                  <Button variant="outline" onClick={zoomOut}>
                    <ZoomOut size={18} />
                  </Button>
                  <span className="min-w-12 text-center text-sm">{Math.round(stageScale * 100)}%</span>
                  <Button variant="outline" onClick={zoomIn}>
                    <ZoomIn size={18} />
                  </Button>
                  <Button variant="outline" onClick={resetZoom}>
                    <Maximize size={18} />
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-1 border-r border-slate-300 pr-3 justify-between h-full">
                <span className="text-sm font-medium text-center">Crop</span>
                <Button onClick={() => onAction('crop', points)}>Apply</Button>
              </div>
            </div>
          </div>
          <div ref={containerRef} className="flex-1 min-w-0 min-h-0 overflow-y-auto flex justify-center bg-calm-background">
            {stageScale > 0 && (
              <Stage width={imageSize.width * stageScale} height={imageSize.height * stageScale} scaleX={stageScale} scaleY={stageScale}>
                <Layer>
                  <KonvaImage image={img} listening={false} />
                  {[
                    [0, 1],
                    [1, 2],
                    [2, 3],
                    [3, 0]
                  ].map(([start, end]) => (
                    <React.Fragment key={`${start}-${end}`}>
                      <Line points={[points[start].x, points[start].y, points[end].x, points[end].y]} stroke="#ffffff" strokeWidth={2} opacity={1} listening={false} />
                      <Line
                        points={[points[start].x, points[start].y, points[end].x, points[end].y]}
                        stroke="#000000"
                        strokeWidth={2}
                        dash={[8, 6]}
                        hitStrokeWidth={30}
                        onMouseEnter={(e) => {
                          let x = e.target.getStage();
                          if (e.target !== null && x !== null) {
                            x.container().style.cursor = getLineCursor(start, end);
                          }
                        }}
                        onMouseLeave={(e) => {
                          let x = e.target.getStage();
                          if (e.target !== null && x !== null) {
                            x.container().style.cursor = 'default';
                          }
                        }}
                        draggable
                        onDragStart={(e) => (lastPos.current = { x: e.target.x(), y: e.target.y() })}
                        onDragMove={(e) => onLineDrag(e, start, end)}
                      />
                      <Circle
                        x={points[start].x}
                        y={points[start].y}
                        radius={10}
                        stroke="#000000"
                        strokeWidth={2}
                        draggable
                        shadowColor="#ffffff"
                        shadowBlur={3}
                        onDragMove={(e) => updatePoint(start, e.target.x(), e.target.y())}
                        onMouseEnter={(e) => {
                          let x = e.target.getStage();
                          if (e.target !== null && x !== null) {
                            x.container().style.cursor = 'pointer';
                          }
                        }}

                        onMouseLeave={(e) => {
                          let x = e.target.getStage();
                          if (e.target !== null && x !== null) {
                            x.container().style.cursor = 'default';
                          }
                        }}
                      />
                    </React.Fragment>
                  ))}
                </Layer>
              </Stage>
            )}
          </div>
        </div>
      )}
    </>
  );
};
export default PageEditor;
