import * as THREE from "three";
import { flatCoordArrayToCoordArray } from "../../utils/three";

export const generateStrand = (length: number) => {
  const geometry = new THREE.CylinderGeometry(0.01, 0.01, length, 10);
  const material = new THREE.MeshBasicMaterial({ color: 0x000000 });

  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
};

export const plantHairStrand = (scalpPosition: THREE.BufferAttribute) => {
  const coords = flatCoordArrayToCoordArray(Array.from(scalpPosition.array));
  coords.forEach((coord) => {});
};
