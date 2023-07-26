# users-api

Api, that supports JWT authentication and allows to create, read, update and delete users.
Implements custom micro framework using `zod`, `fastify`, `fastify-type-provider-zod`, `@fastify/swagger` and `@fastify/swagger-ui`.

## Running

Tested using NodeJS v18.

1. Clone the repository
2. Run `yarn` in the main directory to install dependencies
3. Configure by running `yarn setup:prod` command. Setup will ask configuration settings for env file and create it.
4. Run `yarn start`
5. Open swagger UI in your browser by navigating to `http://{host}:{port}/documentation`, where host and port are values entered in setup step.

This will open api testing page.

You can use `/auth` call with credentials created in setup step to get access token. Use access token from the response to authenticate (use the button in the UI) to be able to access other api routes.

<img width="1013" alt="Screenshot 2023-07-27 at 01 48 36" src="https://github.com/vytux/users-api/assets/206710/7c5c4217-67f4-4cdf-a045-4c6935571e01">


## Running tests

1. Run `yarn` in the main directory to install dependencies
2. Configure by running `yarn setup:test` command. Keep in mind that the database you set will be cleaned up on every tests run, so use a different one from production.
3. Run `yarn test`

<img width="717" alt="Screenshot 2023-07-27 at 01 50 25" src="https://github.com/vytux/users-api/assets/206710/88bf3f80-6314-4d02-801c-4b29abcaa547">


## Development

1. Run `yarn` in the main directory to install dependencies
2. Configure by running `yarn setup:dev` command
3. Run `yarn start:dev`

## Structure

### Files

Directory structure is configured as a monorepo.
Currently has only `server` project.
Additional projects can be added by creating a new directory with `tsconfig` and appending it to the main `tsconfig.ts` file.

Directories:
- `scripts` - contains scripts that can be run using `yarn`
- `types` - contains typescript definitions for libraries that doesn't support typescript
- `server` - contains API project

Server project directory structure:
- `framework` - generic things required to run the server, such as server, controller and actions
- `models` - data schemas
- `repositories` - objects, that interact with data stores
- `services` - objects, that contain business logic
- `controllers` - objects, that contain actions. Action handles http requests.

### Framework

Framework consists of 3 things:

1. `server`, defined in `framework/server.ts`. Sets up and controls http server.
2. `controller`, defined in `framework/controller.ts`. Groups actions and adds route prefix to them.
3. `action`, defined in `framework/action.ts`. Action is an http request handler. They are typed using zod and does automatic type inference based on given `param`, `query`, `body` and `output` parameters.

## Future improvements

- Add http rate limiting using `Fastify-rate-limit` library
- Add cors configuration using `fastify-cors` library
- Add better database abstraction
- Add middleware support
- Separate action input by their sources
