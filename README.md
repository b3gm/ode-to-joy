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

