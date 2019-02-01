# eop (entities of properties)

A simple Dockerized CRUD app using [Postgres](https://www.postgresql.org/), [Express](https://expressjs.com/), and [React](https://reactjs.org/) that manages entities, which have properties.
Migrations are handled in the API and use [db-migrate](https://github.com/db-migrate/node-db-migrate).

## Design decisions

1. Dockerized from the start

   To deliver business value the fastest, you should be in a deployable state from day one. This enables the agile practice of iterative development, and allows stakeholders earlier opportunities to give feedback, saving development time. I'm assuming you know how to deploy Docker apps.

2. A single repo instead of 3. Why? 1 PR for everything instead of 1 PR for the API, and then another for the UI

   This also makes deployments easier as some changes might be tightly coupled between, the API and UI.

3. Migrations in the API (see [Pattern: Database per service](https://microservices.io/patterns/data/database-per-service.html))

   You need migrations. Don't create separate files that you need to run manually. Your application should be as easy to run and deploy as possible.

4. UI React components grouped by features (see [File Structure](https://reactjs.org/docs/faq-structure.html#grouping-by-features-or-routes))

   This makes it easier to focus on features that deliver business value vs getting lost in the technical details of how to implement business features.

5. API calls build into React UI components.

   The whole point of components is that they're reusable. There should be as few tightly coupled relationships between files as possible.

## Prerequisites

- [docker](https://docs.docker.com/install/)
- [docker-compose](https://docs.docker.com/compose/install/)
- [node](https://nodejs.org/en/) (make sure the version used in [ui/Dockerfile](ui/Dockerfile) corresponds to the version used in [.nvmrc](.nvmrc))
- [nvm](https://github.com/creationix/nvm#important-notes)
  Load the version of node used in the project:
  ```bash
  nvm use
  ```

## Running the application

### Startup

```bash
docker-compose build
docker-compose up
```

Open browser to [http://localhost:3000](http://localhost:3000)

### Teardown

Press `Ctrl+C` if in the same terminal instance running the app.
Then run the following:

```bash
docker-compose down
```

## Configuration

### Database

Credentials: see [docker-compose.yml](docker-compose.yml) and [api/config/database.json](api/config/database.json) (they should match)

### UI/API

Make sure the relevant environment vars in [docker-compose.yml](docker-compose.yml) and [ui/config/api.json](ui/config/api.json) match.

## Development

### Linting/Auto-formatting

Uses the following VS Code plugin:

Name: Prettier - Code formatter
Id: esbenp.prettier-vscode
Description: VS Code plugin for prettier/prettier
Version: 1.8.1
Publisher: Esben Petersen
VS Marketplace Link: https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode

### Database Migrations

1.  Start database

    ```bash
    docker-compose up database
    ```

2.  Run migrations forward

    ```bash
    docker-compose run api run npm migrate
    ```

3.  Run migrations backwards

        ```bash
        docker-compose run api run npm rollback
        ```

    See [api/migrations/sqls](api/migrations/sqls) (new migrations: [create](https://db-migrate.readthedocs.io/en/latest/Getting%20Started/commands/#create))

### UI only

1. Install project-wide dev dependencies

   ```bash
   npm install --dev
   ```

2. Start database and api

   ```bash
   docker-compose up database api
   ```

3. In a separate terminal, start the UI

   ```bash
   cd ui
   npm start
   ```

4. Navigate to [http://localhost:3000](http://localhost:3000)
