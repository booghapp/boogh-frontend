# boogh-frontend

## Development

### CSS module type definitions

Styles are defined in [CSS modules](https://github.com/css-modules/css-modules). We use [typed-css-modules](https://github.com/Quramy/typed-css-modules) to generate TypeScript type definition (`.d.ts`) files for each CSS module, which allows the TypeScript compiler to verify the existence of classes, and enables editor auto-completion.

To generate typings, run `npm run generate-type-definitions-for-css-modules` during development.

## Configuration

Configuration is loaded from the shell environment and `.env` files [as described in the React documentation](https://facebook.github.io/create-react-app/docs/adding-custom-environment-variables).

All available environment variables are documented in `.env`, and default values are included where possible.
