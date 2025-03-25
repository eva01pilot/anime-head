import * as THREE from "three";
import { flatCoordArrayToCoordArray } from "../../utils/three";

export class ThreeObject {
  mesh: THREE.Mesh;
  positions: number[][];

  constructor(mesh: THREE.Mesh) {
    this.mesh = mesh;
    this.positions = flatCoordArrayToCoordArray(
      Array.from(mesh.geometry.attributes.position.array),
    );
  }
}
