import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { gsap } from "gsap";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import "./style.css";

// Initialize scene
const canvas = document.querySelector("canvas.webGL");
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
// State management
const state = {
  play: true, // Default value for play
  index: 0 // Default value for index
};

// Start animation loop
animate();

// Function definitions

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
  const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);

  // Define initial color and colors array
  const initialColor = new THREE.Color();
  const colors = [
    initialColor,
    new THREE.Color(0xff0000),
    new THREE.Color(0x00ff00),
    new THREE.Color(0x0000ff)
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
  const { play, index } = state;

  if (play) {
    state.index = index === colors.length - 1 ? 0 : index + 1;
  }

  gsap.to(material.uniforms.u_progress, {
    value: 0,
    duration: 0,
    onComplete: () => {
      animateColor(state.index);
    }
  });
}

function animateColor(colorIndex) {
  gsap.to(material.uniforms.u_progress, {
    value: 1,
    duration: 4,
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
    }
  });
}

function animate() {
  let previousTime = performance.now();

  function tick() {
    const currentTime = performance.now();
    const deltaTime = (currentTime - previousTime) / 1000;
    previousTime = currentTime;

    // Update u_time with delta time
    material.uniforms.u_time.value += deltaTime;

    controls.update();
    renderer.render(scene, perspectiveCamera);
    window.requestAnimationFrame(tick);
  }

  function loop() {
    const { play } = state;
    if (play) {
      tick();
      requestAnimationFrame(loop);
    }
  }

  loop();
}
