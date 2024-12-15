import './style.css'
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RenderPass } from 'three/examples/jsm/Addons.js';
import { EffectComposer } from 'three/examples/jsm/Addons.js';
import { UnrealBloomPass } from 'three/examples/jsm/Addons.js';

// Scene

const texloader = new THREE.TextureLoader();

const scene = new THREE.Scene();
scene.background = texloader.load('/img/bg.png');

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 400;
camera.position.x = -120;

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth+1, window.innerHeight);

// Effects

const renderScene = new RenderPass(scene, camera);
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1,
  1,
  1
);
composer.addPass(bloomPass);

// Models

const gltfloader = new GLTFLoader();

let ufo;
gltfloader.load('/models/ufo/ufo.gltf', (gltf) => {
  ufo = gltf;
  scene.add(gltf.scene);
  gltf.scene.position.set(150, -130, 0);
  gltf.scene.rotation.z = 0.2;

  gltf.scene.traverse((object) => {
    if (object.name == "lights") {
      object.material.color.set(5, 5, 5);
    }
  })
})

const planetTexture = texloader.load('/models/planet/planet_colour.jpg');
const planetNormal = texloader.load('/models/planet/planet_normal.jpg');
const planet = new THREE.Mesh(
  new THREE.SphereGeometry(200, 32, 32),
  new THREE.MeshStandardMaterial({
    map: planetTexture,
    normalMap: planetNormal
  })
);
planet.material.color.setRGB(2, 2, 2);
planet.position.set(100, 150, -300);
scene.add(planet);

const starGeometry = new THREE.SphereGeometry(1, 24, 24);
const starMaterial = new THREE.MeshStandardMaterial({color: 0xffffff})
starMaterial.color.setRGB(10, 10, 10);

function addStar() {
  const star = new THREE.Mesh(starGeometry, starMaterial);
  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(600));
  star.position.set(x-120, y, z);
  scene.add(star);
};

Array(200).fill().forEach(addStar);

// Lights

const ambientLight = new THREE.AmbientLight(0xffd9ea);
scene.add(ambientLight);

const directionLight = new THREE.DirectionalLight(0xffd9ea);
scene.add(directionLight);

// Animation

animate();

let ufoPosition = 0.5;

function animate() {
  requestAnimationFrame(animate);

  if (ufo) {
    ufo.scene.position.y += ufoPosition;
    if (ufo.scene.position.y <= -130) {
      ufoPosition = 0.5;
    }
    else if (ufo.scene.position.y >= -40) {
      ufoPosition = -0.5;
    }
  }

  planet.rotation.y += 0.01;
  if (planet.rotation.y >= 6.3) {
    planet.rotation.y = 0;
  }

  composer.render();
}

// Responsiveness

function onResize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
}

window.addEventListener("resize", onResize);

// Interactivity

let prevX = 0;
let ufoRotation = 0;

function rotateObject(e) {
  if (ufo) {
    ufo.scene.rotation.y += ufoRotation;
    if (prevX > e.clientX) {
      ufoRotation = 0.07;
    }
    else if (prevX < e.clientX) {
      ufoRotation = -0.07;
    }
  }
  prevX = e.clientX;
}

window.addEventListener("mousemove", rotateObject);