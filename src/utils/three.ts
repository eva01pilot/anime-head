import { GLTFLoader, type GLTF } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { Camera } from "three";
export const loadModel = (path: string) => {
  const loader = new GLTFLoader();
  return new Promise<GLTF>((res, rej) => {
    loader.load(
      path,
      function (gltf) {
        res(gltf);
      },
      undefined,
      function (error) {
        rej(error);
      },
    );
  });
};

export const makeOrbitControls = (camera: Camera, renderer: HTMLElement) => {
  // Attach controls to the camera
  const controls = new OrbitControls(camera, renderer);
  controls.enableDamping = true; // Smooth movement
  controls.dampingFactor = 0.05;
  controls.minDistance = 1; // Minimum zoom
  controls.enableRotate;
  controls.maxDistance = 100; // Maximum zoom
  return controls;
};

export const flatCoordArrayToCoordArray = (arr: number[]) => {
  const newArr: number[][] = [];
  for (let i = 0; i < arr.length; i += 3) {
    console.log(arr.length);
    newArr.push([arr[i], arr[i + 1], arr[i + 2]]);
  }
  return newArr;
};
