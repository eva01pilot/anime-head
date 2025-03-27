<template>
  <canvas ref="canvas" />
</template>

<script setup lang="ts">
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { onMounted, ref, useTemplateRef } from "vue";
import { loadModel, makeOrbitControls } from "./utils/three";
import {
  generateLineSegments,
  generateStrands,
  getParticlesPositions,
  samplePoints,
} from "./three-app/hair/generateStrands";
import { LineSegmentParticle } from "./three-app/hair/generateStrands";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x333333);
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

const canvas = useTemplateRef("canvas");

const paused = ref(false);

document.addEventListener("keyup", (e) => {
  console.log(e.key);
  if (e.key === " ") {
    paused.value = !paused.value;
    console.log(paused.value);
  }
});

onMounted(async () => {
  if (!canvas.value) return;
  const renderer = new THREE.WebGLRenderer({ canvas: canvas.value });
  renderer.setSize(window.innerWidth, window.innerHeight);

  const blenderScene = await loadModel("headscalp.glb");
  const head = blenderScene.scene.children[0];
  const scalp = blenderScene.scene.children[1];

  scene.add(head);
  scene.add(scalp);

  if (head instanceof THREE.Mesh) {
    head.material = new THREE.MeshPhongMaterial();
  }
  if (scalp instanceof THREE.Mesh) {
    scalp.material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  }
  const controls = makeOrbitControls(camera, canvas.value);

  camera.position.z = 5;
  scene.add(camera);

  const light = new THREE.AmbientLight(0xffffff); // soft white light
  scene.add(light);
  if (scalp instanceof THREE.Mesh) {
    const points = samplePoints(scalp);
    const strands = generateStrands(points, 4, 5);
    const segments = generateLineSegments(strands);
    const linesParticlesArray: LineSegmentParticle[] = [];
    segments.forEach((seg) => {
      const linesParticles = new LineSegmentParticle(seg);
      linesParticlesArray.push(linesParticles);
      scene.add(seg);
    });

    function animate() {
      renderer.render(scene, camera);
      linesParticlesArray.forEach((lp) => {
        if (paused.value) return;
        lp.updateLine();
      });
      controls.update();
    }

    /*
    renderer.setAnimationLoop((a) => {
      animate();
    });
    */

    setInterval(animate, 50);
  }
});
</script>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
