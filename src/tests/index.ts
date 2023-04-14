import * as three from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { rungeKuttaThreeEightsRule } from "../explicit-solvers";
import { createGenericExplicitSolver } from "../generic-explicit-solver";
import { abSolarSystem } from "./model/ab-solar-system";
import { createSolarSystem } from "./model/create-solar-system";
import { SolarSystem } from "./model/solar-system";
import { derivative } from "./model/solar-system-derivative";

function addSolarSystemToScene(solarSystem: SolarSystem, scene: three.Scene) {
  solarSystem.forEachBody((body) => {
    scene.add(body.mesh);
    const light = body.light;
    if (light) {
      scene.add(light);
    }
  })
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("Dom ready!");
  const cvs = document.querySelector("canvas");
  if (!cvs) {
    throw new Error("Canvas not found.");
  }
  const solarSystem = createSolarSystem({
    radiusScale: 20.0,
    bodyCount: 6,
    asteroidCount: 20,
    eclipticWobble: 0.3
  });
  const scene = new three.Scene();
  addSolarSystemToScene(solarSystem, scene);
  const ambientLight = new three.AmbientLight(
    0xffffff,
    0.2
  );
  scene.add(ambientLight);
  /*
  const hemiLight = new three.HemisphereLight(
    new three.Color(0xa0a0ff),
    new three.Color(0xa0a0ff),
    1.0
  );
  scene.add(hemiLight);//*/
  const camera = new three.PerspectiveCamera(
    65.0,
    cvs.width / cvs.height,
    0.1,
    10000.0
  );
  camera.position.set(-100, 20, -100);
  camera.lookAt(new three.Vector3());
  const controls = new OrbitControls(camera, cvs);
  controls.update();

  const renderer = new three.WebGLRenderer({
    canvas: cvs,
    logarithmicDepthBuffer: true,
    antialias: true
  });

  const solarSystemSolver = createGenericExplicitSolver({
    itemType: abSolarSystem,
    //solver: midPointMethod,
    solver: rungeKuttaThreeEightsRule
  })(derivative);

  function updateAndRender(delta: number) {
    solarSystem.forEachBody(body => body.tic(delta));
    const advancePhysics = solarSystemSolver(solarSystem);
    advancePhysics(delta / 1000.0);
    controls.update();
    renderer.render(scene, camera);
  }

  ((function() {
    let time = Date.now();
    function loop() {
      requestAnimationFrame(loop);
      const currentTime = Date.now();
      const delta = Math.min(1000 / 60, currentTime - time);
      time = currentTime;
      updateAndRender(delta);
    }
    requestAnimationFrame(loop);
  })());
});