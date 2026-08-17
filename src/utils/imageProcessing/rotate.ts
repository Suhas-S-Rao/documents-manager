import { getOpenCV } from './opencv';

export async function rotateImage(canvas: HTMLCanvasElement, angle: number) {
  const cv = await getOpenCV();

  const src = cv.imread(canvas);

  const dst = new cv.Mat();

  if (angle === 90) {
    cv.rotate(src, dst, cv.ROTATE_90_CLOCKWISE);
  }
  else if (angle === 180) {
    cv.rotate(src, dst, cv.ROTATE_180);
  }
  else if (angle === 270 || angle === -90) {
    cv.rotate(src, dst, cv.ROTATE_90_COUNTERCLOCKWISE);
  }

  const output = document.createElement('canvas');

  cv.imshow(output, dst);

  src.delete();
  dst.delete();

  return output;
}
