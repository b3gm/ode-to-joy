ode-to-joy
==========

Typescript implementation of solvers for ordinary differential equations
and integrating initial value problems.


Problem Description
-------------------

This library solves initial value problems of the form

```
y'(t) = f(y(t))
with initial value: y(t_0) = y_0
```

for unknown vector valued functions `y(t): R -> R^N` where `f(y(t))` denotes its derivative at point `y(t)`. The real variable `t` is often regarded as time for physical systems.

Since the time variable usually increases in a linear fashion not dependent on the state on state of the system, it is usually eliminated from the problem description:

```
y' = f(y)
with initial value y_0
```

This library solves the initial value problem using different explicit, single step [Runge-Kutta methods](https://en.wikipedia.org/wiki/Runge%E2%80%93Kutta_methods).

Ode-to-joy's architecture is separated into the following two layers:

- A math layer which implements the actual solvers. Points `y` are modelled using javascript's built-in `Float64Array`s
- An optional mapping layer, which can be used to map float values from those arrays into your business objects and vice versa.


Math Layer
----------

The different solvers are exported as `explicitSolvers`. Implicit solvers might be added in the future.

All explicit solvers implement the following interface

```typescript
export type ExplicitSolver = (
  current: Float64Array,
  stepSize: number,
  fDash: (current: Float64Array) => Float64Array
) => Float64Array;
```

where `current` is `y_0` from the problem description for a single execution, `stepSize` is the increment in time and fDash is used by the solver to sample the derivative of `y` at different points. For calculating a solution over longer periods of time, this function has to be called repeatedly by feeding the result of one step into the `current` parameter of the next invocation.

Lowering the step size parameter produces lower errors for integrating the equation but will also be more computationally expensive for covering the same period in time. The rate at which this error falls depends on the solver being used and can be expressed as

```
| y_h(t) - y(t) | = O(h^n), for h approaches 0
```

where the parameter `h` is the step size, `O` is the Landau symbol "big O", `y_h(t)` is the approximated solution of the initial value problem, which was found using step size `h` and `y(t)` is the real solution of the initial value problem (which typically cannot be computed analytically). The integer parameter `n` depends on the solver being used. Solvers with higher values of `n` produce smaller errors for a given step size but also need to sample the derivative `fDash` more often.

As a simple example the one dimensional initial value problem

```
y'(t) = y(t)
y_0 = 1.0
```

can be integrated as follows using a step size of `0.01`:

```typescript
import { explicitSolvers } from "@b3gm/ode-to-joy";


let current = new Float64Array(1);
current[0] = 1;
for (let i = 0; i != 100; ++i) {
  current = explicitSolvers.rungeKutta4(
    current,
    0.01,
    v => v // fDash: y' = y
  );
}
console.log("Solution:", current[0]); // 2.718281828234403
```

Mapping Layer - Array Backed Types
----------------------------------

Ode-to-joy provides an optional mapping layer to help out with mapping the above mentioned `Float64Array` to and from your own or third party business objects. This lets you express the derivative `fDash` in terms of the domain of your choice, hopefully making its implementation more readable and eliminating the need for your domain objects to keep track of their host array indices.

In order for this mapping layer to work however, you need to provide a corresponding description of so called array backed types, which can be constructed and composed with each other by using the provided factory methods exported via `abTypes`:

- `abTypes.float(): ABType<number>`: The most primitive array backed type, mapps a single float between your objects and `Float64Array`s.
- `abTypes.object<T>(props: ABObjectDescription<T>): ABType<T>`: Mapps between arrays and mutable object types by directly writing values to your objects using the regular property accessor `[propertyName]`. The object description might only contain a subset of your object's actual properties. You only need to map the values, that are supposed to change under the initial value problem.
- `abTypes.valueObject<T, P>(ctor: (props: P) => T, description: ValueObjectDescription<T, P>): ABType<T>`: Similar to object, but instead of writing directly to properties of your objects, this `ABType` creates new objects from the described properties using the provided constructor. Values are read using the provided property accessors.
- `abTypes.array<T>(itemType: ABType<T>, fixedLength?: number): ABType<T[]>`: Takes an array backed type and returns the corresponding array backed array type. The optional fixedLength parameter can be used to help out with calculating the required host array's length. The size of your objects are anyway not supposed to change during derivative evaluations, but it might change from one step to the next. If the `fixedLength` parameter is omitted, the host array's length will be determined dynamically.

Suppose you want to interface with the 3D library threejs and you modelled bodies with a type like this:

```typescript
import { Vector3 } from "three";


interface Body {
  mass: number;
  position: Vector3;
  velocity: Vector3;
  force: Vector3;
  // ...
}
```

The corresponding array backed types can be created like so:

```typescript
import { abTypes } from "@b3gm/ode-to-joy";


const arrayBackedVector: ABType<Vector3> = abTypes.object({
  x: abTypes.float(),
  y: abTypes.float(),
  z: abTypes.float()
});

const arrayBackedBody: ABType<Body> = abTypes.object({
  // mass and force fields can be omitted, if they are not supposed to be 
  // integrated over time.
  position: arrayBackedVector,
  velocity: arrayBackedVector
});

const arrayBackedBodyArray: ABType<Body[]> = abTypes.array(arrayBackedBody);
```

Now with `arrayBackedBodyArray`, which represents the set of bodies that compose your physical system, you can now use `createGenericExplicitSolver` and a derivative function written in the `Body` domain to evolve your system over time:

```typescript
import {
  createGenericExplicitSolver,
  explicitSolvers
} from "@b3gm/ode-to-joy";


const system: Body[] = /* construct initial system */;
const systemSolver = createGenericExplicitSolver({
  itemType: arrayBackedBodyArray,
  solver: explicitSolvers.rungeKutta4
})((bodies: Body[]) => {
  // usually start by resetting all forces or initializing them with externals.
  bodies.forEach((body) => body.force.set(0, 0, 0));

  // Calculate the derivative of bodies' fields by evaluating exchange forces.
  // This depends on the nature of your model, so this is left as an exercise
  // to the reader ;o)

  bodies.forEach((body) => {
    // The derivative of the position is velocity
    body.position.copy(body.velocity);
    // and the derivative of velocity is acceleration.
    body.velocity.copy(body.force.divideScalar(body.mass));
  });
  return bodies; // either return the modified system, or a new value.
});

// the exact value for the step size again depends on the nature of your model
// if forces are calculated on the basis of time in milliseconds and you need
// 60 frames per second you would advance your system like this. Usually called
// from within a requestAnimationFrame loop:
systemSolver(bodies)(1000/60);
```
