# Esqlate Lib

Esqlate Lib is the home for TypeScript definitions, JSON/OpenAPIv3 Schemas and a small amount of shared code for the [Esqlate Project](https://github.com/forbesmyester/esqlate), primarily [Esqlate Server](https://github.com/forbesmyester/esqlate-server) and [Esqlate Front](https://github.com/forbesmyester/esqlate-front).

## Instructions

To build assets (which includes the definitions and schemas) you will need to nstall:

 * [NodeJS](https://nodejs.org/en/)
 * [JSONNET](https://jsonnet.org/)
 * [GNU Parallel](https://www.gnu.org/software/parallel/)

After this you can run:

```bash
npm install
npm run-script build
```

Once this is done schemas as definitions are stored in the [res](./res}) directory and there is a nice browser viewable version of the OpenAPIv3 spec at [redoc-static.html](./redoc-static.html).
