import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { gsap } from "gsap";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import "./style.css";

// Initialize scene
const canvas = document.querySelector("canvas.webGL");
canvas.style.cursor = "grab";
const scene = new THREE.Scene();

// Set up renderer
const renderer = initRenderer(canvas);

// Set up camera
const perspectiveCamera = initCamera();

// Set up controls
const controls = initControls(perspectiveCamera, canvas);

// Initialize geometry, material, and colors
const { geometry, material, colors } = initGeometryAndMaterial();

// Create plane mesh
const planeMesh = new THREE.Mesh(geometry, material);
scene.add(planeMesh);

// Add event listeners
window.addEventListener("resize", onWindowResize);
canvas.addEventListener("click", handleClick);

document.querySelector(".frame__title").addEventListener("click", function () {
  const githubLink = this.getAttribute("data-href");
  if (githubLink) {
    window.location.href = githubLink;
  }
});

const storedState = JSON.parse(localStorage.getItem("animationState"));
const initialState = {
  play: true,
  index: 0,
  animating: false
};
let state = storedState || initialState;

const cleanup = animate();

function initRenderer(canvas) {
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
  };

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
  });

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0xffffff);

  return renderer;
}

function initCamera() {
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
  };

  const perspectiveCamera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    100
  );
  perspectiveCamera.position.set(0, 0, 1);

  return perspectiveCamera;
}

function initControls(camera, canvas) {
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;

  return controls;
}

function initGeometryAndMaterial() {
  const geometry = new THREE.PlaneGeometry(3.4, 3.4, 32, 32);
  const initialColor = new THREE.Color();
  const colors = [
    initialColor,
    new THREE.Color(0x8c75ff),
    new THREE.Color(0x5cffab),
    new THREE.Color(0x0000ff),
    new THREE.Color(0xf74a8a),
    new THREE.Color(0x3df2f2)
  ];

  // Create a material
  const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    side: THREE.DoubleSide,
    uniforms: {
      u_time: { value: 0 },
      u_progress: { value: 0 },
      u_aspect: { value: 1 },
      u_color: { value: initialColor }
    }
  });

  return { geometry, material, colors };
}

function onWindowResize() {
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
  };

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  perspectiveCamera.aspect = sizes.width / sizes.height;
  perspectiveCamera.updateProjectionMatrix();
}

function handleClick() {
  const { index, animating } = state;

  if (!animating) {
    state.index = index === colors.length - 1 ? 0 : index + 1;
    animateColor(state.index);
  }
}

function animateColor(colorIndex) {
  state.animating = true;
  material.uniforms.u_progress.value = 0;

  gsap.to(material.uniforms.u_progress, {
    value: 1,
    duration: 3,
    ease: "power2.out",
    onUpdate: () => {
      const currentColor = material.uniforms.u_color.value;
      const targetColor = colors[colorIndex];
      const lerpedColor = currentColor.lerp(
        targetColor,
        material.uniforms.u_progress.value
      );
      material.uniforms.u_color.value = lerpedColor;
    },
    onComplete: () => {
      material.uniforms.u_color.value = colors[colorIndex];
      state.animating = false;
      localStorage.setItem("animationState", JSON.stringify(state));
    }
  });
}

function animate() {
  const ticker = gsap.ticker.add(tick);

  function tick(time, deltaTime) {
    material.uniforms.u_time.value += deltaTime / 1000; // Convert to seconds

    controls.update();
    renderer.render(scene, perspectiveCamera);
  }

  return ticker;
}
