import * as three from "three";

function createTestScene(cvs: HTMLCanvasElement) {
  const width = 1024;
  const height = 800;
  cvs.width = 1024;
  cvs.height = 800;

  const scene = new three.Scene();
  scene.background = new three.Color(0xa0a0ff);
  const light = new three.DirectionalLight(0xffffff, 1.0);
  const camera = new three.PerspectiveCamera(
    75,
    width / height,
    0.1,
    10000.0
  );
  scene.add(light);
  const renderer = new three.WebGLRenderer({
    canvas: cvs,
    logarithmicDepthBuffer: true,
  });
}

interface TestSceneProperties {
  scene: three.Scene;
  camera: three.PerspectiveCamera;
  renderer: three.WebGLRenderer;
  
}

class TestScene {
  constructor(
    private readonly scene: three.Scene,
    private readonly camera: three.Camera,
    private readonly renderer: three.WebGLRenderer
  ) {
  }
}