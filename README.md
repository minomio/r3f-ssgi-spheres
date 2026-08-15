npm run dev

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

Based on https://pmndrs.github.io/examples/examples/ssgi-spheres-with-rapier-physics.md


  Dependencies:
                                                                                                           
  ┌─────────────────────────────┬──────────────────────────────────────────────┐                         
  │           Package           │                   Purpose                    │
  ├─────────────────────────────┼──────────────────────────────────────────────┤                           
  │ three                       │ Core 3D engine                               │
  ├─────────────────────────────┼──────────────────────────────────────────────┤                           
  │ @react-three/fiber          │ React renderer for Three.js                  │                         
  ├─────────────────────────────┼──────────────────────────────────────────────┤
  │ @react-three/drei           │ Helpers/abstractions for R3F                 │
  ├─────────────────────────────┼──────────────────────────────────────────────┤                           
  │ @react-three/postprocessing │ Post-processing effects for R3F              │
  ├─────────────────────────────┼──────────────────────────────────────────────┤                           
  │ @react-three/rapier         │ Physics (Rapier engine bindings)             │                         
  ├─────────────────────────────┼──────────────────────────────────────────────┤
  │ postprocessing              │ Underlying post-processing library           │
  ├─────────────────────────────┼──────────────────────────────────────────────┤                           
  │ maath                       │ Math utilities for 3D (easing, random, etc.) │
  └─────────────────────────────┴──────────────────────────────────────────────┘

  npm install three @react-three/fiber @react-three/drei @react-three/postprocessing @react-three/rapier   
  postprocessing maath