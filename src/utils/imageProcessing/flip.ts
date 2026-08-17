export type FlipType = 'horizontal' | 'vertical';
const flip = async (canvas: HTMLCanvasElement, direction: FlipType): Promise<HTMLCanvasElement> => {
  const result = document.createElement('canvas');
  result.width = canvas.width;
  result.height = canvas.height;
  const ctx = result.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context not available');
  }
  if (direction === 'horizontal') {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  } else {
    ctx.translate(0, canvas.height);
    ctx.scale(1, -1);
  }
  ctx.drawImage(canvas, 0, 0);
  return result;
};
export default flip;
