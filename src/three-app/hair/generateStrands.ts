import * as THREE from "three";
import { MeshSurfaceSampler } from "three/examples/jsm/Addons.js";

type SampledVerticeWithNormal = {
  position: THREE.Vector3;
  normal: THREE.Vector3;
};

export const samplePoints = (scalp: THREE.Mesh) => {
  const sampler = new MeshSurfaceSampler(scalp)
    .setWeightAttribute(null) // Optional: set custom weighting (if needed)
    .build();

  const numSamples = 1; // Adjust density
  const sampledVertices: SampledVerticeWithNormal[] = [];

  for (let i = 0; i < numSamples; i++) {
    const position = new THREE.Vector3();
    const normal = new THREE.Vector3();

    sampler.sample(position, normal); // Sample position & normal

    sampledVertices.push({ position, normal: normal.normalize() });
  }
  return sampledVertices;
};

export const generateStrands = (
  sampledVertices: SampledVerticeWithNormal[],
  strandSegments: number,
  strandLength: number,
) => {
  const hairStrands: THREE.Vector3[][] = []; // Store particle chains

  sampledVertices.forEach((root) => {
    const normal = root.normal.clone().normalize(); // Ensure normal is normalized
    let lastPosition = root.position.clone();
    const strand = [lastPosition.clone()]; // Root particle

    // Calculate each segment along the normal direction
    for (let j = 1; j < strandSegments; j++) {
      // Offset each segment along the normal direction
      const segment = lastPosition
        .clone()
        .add(normal.multiplyScalar(strandLength / strandSegments)); // Divide length by segment count to get proper spacing
      strand.push(segment);
      lastPosition = segment; // Update position for next iteration
    }

    hairStrands.push(strand);
  });

  // Debugging: Log the number of strands and the first few segments of each strand

  return hairStrands;
};

export const generateLineSegments = (strands: THREE.Vector3[][]) => {
  const material = new THREE.LineBasicMaterial({
    color: 0x000000,
    linewidth: 50,
  });
  const hairLines: THREE.LineSegments[] = [];
  strands.forEach((strand) => {
    const geometry = new THREE.BufferGeometry();
    const points = [];

    for (let i = 0; i < strand.length - 1; i++) {
      points.push(strand[i], strand[i + 1]); // Create line segments
    }

    geometry.setFromPoints(points);
    const line = new THREE.LineSegments(geometry, material);

    hairLines.push(line);
  });
  return hairLines;
};

export class LineSegmentParticle {
  lineSegment: THREE.LineSegments;
  vertices: THREE.Vector3[];
  previousVertices: THREE.Vector3[];
  gravity: THREE.Vector3; // Gravity force
  wind: THREE.Vector3; // Wind force

  constructor(
    line: THREE.LineSegments,
    gravity: THREE.Vector3 = new THREE.Vector3(0, -9.8, 0),
    wind: THREE.Vector3 = new THREE.Vector3(0, 0, 0),
  ) {
    this.lineSegment = line;
    this.vertices = [];
    this.previousVertices = []; // Get initial particle positions from LineSegments
    this.gravity = gravity; // Default gravity
    this.wind = wind; // Default wind
    this.calculatePositions();
  }

  // Update particle positions based on forces (gravity and wind) using Verlet integration
  update(dt: number) {
    const acceleration = new THREE.Vector3()
      .clone()
      .add(this.gravity)
      .add(this.wind); // Add gravity and wind forces

    const newPosition = this.vertices.map((vert, i) => {
      if (i === 0) {
        return vert.clone(); // Root particle stays fixed at its position
      }

      // Apply Verlet integration uniformly to all particles
      const newVert = vert
        .clone()
        .multiplyScalar(2)
        .sub(this.previousVertices[i])
        .add(acceleration.clone().multiplyScalar(dt * dt)); // Update particle position with acceleration (gravity + wind)
      return newVert;
    });

    // Update previous positions
    this.previousVertices = this.vertices.map((vert) => vert.clone());
    this.vertices = newPosition;
  }

  // Update line geometry based on the new particle positions
  updateLine() {
    this.update(0.016); // Assume 60 FPS, delta time ~ 1/60s

    const geometry = this.lineSegment.geometry;
    const positionArray = geometry.attributes.position.array;

    // Update the position array with new particle positions
    for (let i = 0; i < this.vertices.length; i++) {
      const pos = this.vertices[i].clone();
      positionArray[i * 3] = pos.x; // x component
      positionArray[i * 3 + 1] = pos.y; // y component
      positionArray[i * 3 + 2] = pos.z; // z component
    }
    let a1 = this.vertices[4].y - this.previousVertices[4].y;
    let a2 = this.vertices[5].y - this.previousVertices[5].y;

    console.log(a1 === a2);
    // Mark the position attribute as needing an update for rendering
    geometry.attributes.position.needsUpdate = true;
  }

  // Function to calculate initial positions
  calculatePositions() {
    this.vertices = getParticlesPositions(this.lineSegment);
    this.previousVertices = getParticlesPositions(this.lineSegment);
  }
}

// Helper function to get initial positions of particles from the LineSegments geometry
function getParticlesPositions(
  lineSegment: THREE.LineSegments,
): THREE.Vector3[] {
  const positions = lineSegment.geometry.attributes.position.array;
  const vertices: THREE.Vector3[] = [];

  // Extract the positions from the geometry
  for (let i = 0; i < positions.length; i += 3) {
    const vertex = new THREE.Vector3(
      positions[i],
      positions[i + 1],
      positions[i + 2],
    );
    vertices.push(vertex);
  }

  return vertices;
}
