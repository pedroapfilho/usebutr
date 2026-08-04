# @usebutr/react

## 0.1.9

### Patch Changes

- Updated dependencies [7887cf0]
- Updated dependencies [7887cf0]
- Updated dependencies [f0a5116]
- Updated dependencies [f0a5116]
  - @usebutr/core@1.0.0

## 0.1.8

### Patch Changes

- Updated dependencies [4467a5e]
  - @usebutr/core@0.5.0

## 0.1.7

### Patch Changes

- Updated dependencies [c1309ee]
  - @usebutr/core@0.4.2

## 0.1.6

### Patch Changes

- 8200f3e: `useGetWallet` and `useGetSelectedWallet` now return referentially stable accessors (memoized on the store instance), as their docs already promised. Consumers using the returned function in effect dependencies no longer re-run the effect on every render.
- Updated dependencies [937dfae]
  - @usebutr/core@0.4.1

## 0.1.5

### Patch Changes

- a46eecd: Ship unminified ESM so downstream bundlers (Vite/esbuild dep pre-bundling) process the package correctly; fixes a ReferenceError in consumer dev servers. The consuming app minifies once at its own build.
- Updated dependencies [b5322ae]
- Updated dependencies [d5f32c7]
- Updated dependencies [a46eecd]
  - @usebutr/core@0.4.0

## 0.1.4

### Patch Changes

- Updated dependencies [886ee1d]
  - @usebutr/core@0.3.0

## 0.1.3

### Patch Changes

- Updated dependencies [db5d7e9]
  - @usebutr/core@0.2.2

## 0.1.2

### Patch Changes

- Updated dependencies [f846e77]
  - @usebutr/core@0.2.1

## 0.1.1

### Patch Changes

- Updated dependencies [b77a477]
  - @usebutr/core@0.2.0
