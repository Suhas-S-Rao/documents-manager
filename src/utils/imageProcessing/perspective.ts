import { getOpenCV } from './opencv';

export interface Point {
  x: number;
  y: number;
}

function distance(a: Point, b: Point) {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
}

export async function perspectiveTransform(canvas: HTMLCanvasElement, points: Point[]) {
  const cv = await getOpenCV();

  const src = cv.imread(canvas);

  const width = Math.round(Math.max(distance(points[0], points[1]), distance(points[2], points[3])));

  const height = Math.round(Math.max(distance(points[0], points[3]), distance(points[1], points[2])));

  const srcMat = cv.matFromArray(
    4,
    1,
    cv.CV_32FC2,
    points.flatMap((p) => [p.x, p.y])
  );

  const dstMat = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, width, 0, width, height, 0, height]);

  const matrix = cv.getPerspectiveTransform(srcMat, dstMat);

  const dst = new cv.Mat();

  cv.warpPerspective(src, dst, matrix, new cv.Size(width, height));

  const output = document.createElement('canvas');

  cv.imshow(output, dst);

  src.delete();
  dst.delete();
  matrix.delete();
  srcMat.delete();
  dstMat.delete();

  return output;
}
