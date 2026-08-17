import { getOpenCV } from './opencv';

export type EnhanceMode = 'original' | 'grayscale' | 'document';

const enhanceImage = async (canvas: HTMLCanvasElement, mode: EnhanceMode) => {
  const cv = await getOpenCV();
  const src = cv.imread(canvas);
  const dst = new cv.Mat();

  if (mode === 'grayscale') {
    cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
  } else if (mode === 'document') {
    const gray = new cv.Mat();
    const blur = new cv.Mat();

    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
    cv.GaussianBlur(gray, blur, new cv.Size(5, 5), 0);
    cv.adaptiveThreshold(blur, dst, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 3, 3);

    gray.delete();
    blur.delete();
  } else {
    src.copyTo(dst);
  }

  const output = document.createElement('canvas');
  cv.imshow(output, dst);
  src.delete();
  dst.delete();
  return output;
};
export default enhanceImage;