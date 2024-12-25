### Rewrite notes

Plan:

- ditch the whole UI for constructing the configuration. It's not worth it. It's far too fringe a script, it's a lot of work and it doesn't even make that much sense at the end of it. Users would still have to do a ton of stuff to generate the data files and install on their site.
- still offer both React + standalone versions.
- rethink config file structure
  - needs:
    1. a buildtime config for generating data
    2. a runtime config for the react component
  - use same structure for React + for standalone JS
  - pass in all variables.
  - clearly separate `constants` from this config. That's internal.
- above all, needs:
  - clear instructions to follow
  - clear documentation of options

### Build time config

See `BuildConfig` type from `types/public.d.ts`.
