import * as three from "three";
import { Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ABType } from "../array-backed-types/ab-type";
import { heunMethod, midPointMethod } from "../explicit-solvers";
import { createGenericExplicitSolver } from "../generic-explicit-solver";
import { abTypes } from "../index";
import { abSolarSystem } from "./model/ab-solar-system";
import { Body } from "./model/body";
import { createSolarSystem } from "./model/create-solar-system";
import { SolarSystem } from "./model/solar-system";

document.addEventListener("DOMContentLoaded", () => {
  console.log("Dom ready!");
  const cvs = document.querySelector("canvas");
  if (!cvs) {
    throw new Error("Canvas not found.");
  }
  const solarSystem = createSolarSystem();
  const {celestialBodies, asteroids, gravityConstant} = solarSystem;
  const scene = new three.Scene();
  celestialBodies.forEach(body => scene.add(body.mesh));
  asteroids.forEach(ast => scene.add(ast.mesh));
  const camera = new three.PerspectiveCamera(
    65.0,
    cvs.width / cvs.height,
    0.1,
    10000.0
  );

  const solarSystemSolver = createGenericExplicitSolver<SolarSystem>(
    abSolarSystem(solarSystem),
    midPointMethod
  );

  function loop() {
    
  }


  

});