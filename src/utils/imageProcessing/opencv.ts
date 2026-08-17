

import cvPromise from '@techstark/opencv-js';

let instance: any = null;

export async function getOpenCV() {
  if (instance) {
    return instance;
  }
  instance = await cvPromise;
  return instance;
}
