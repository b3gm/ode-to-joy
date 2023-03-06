import { Vector3 } from "three";
import { ABType } from "../../array-backed-types/ab-type";
import {abTypes as abTypes} from "../../index";
import { Body } from "./body";

export const vector3Model: ABType<Vector3> = abTypes.object({
  x: abTypes.float(),
  y: abTypes.float(),
  z: abTypes.float()
})

export const bodyModel: ABType<Body> = abTypes.object({
  position: abTypes.object({
    x: abTypes.float(),
    y: abTypes.float(),
    z: abTypes.float()
  })
});