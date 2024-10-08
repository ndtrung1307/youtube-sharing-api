## Description

This repository contains an API server built with the [Nest](https://github.com/nestjs/nest) framework to support YouTube video sharing. The server provides APIs to share, manage, and retrieve YouTube videos, as well as features for user login and sign-up.

API document: https://youtube-sharing-api.onrender.com/swagger

- Register new user via API `[POST] /v1.0/auth/register` with valid email and strong password
- Login via API `[POST] /v1.0/auth/login`
- Get list shared videos via API `[GET] /v1.0/videos`
- `[Authentication Required]` Share a Youtube videos via API `[POST] /v1.0/videos` with valid Youtube Video URL

### Deployment

Application is deployed on OnRender and config trigger hook at `develop` branch. App run as Container and configured in `DockerFile`. Parameters are configured directly on OnRender project setting.

This application is using Free Package for cost saving purpose. It caused Cold Start problem if server is inactive for a while and It takes from 50 seconds to some minutes to start at first time.

Note: Trigger [Backend API docs](https://youtube-sharing-api.onrender.com/swagger) before open React App is help us to prevent unexpected timeout issue.

## Quick Start

Follow these steps to quickly start the application:

### Requirements

- Docker
- Docker Compose

### Before running app

Create a `.env.local` file in the root directory with the following content:

```env
NODE_ENV=local
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=username
POSTGRES_PASSWORD=password
POSTGRES_DB=postgres
CORS_ORIGIN=*
JWT_SECRET=testSecret
YOUTUBE_API_KEY=This key is used to authenticate with the YouTube API and need to protected. Provide while submit via form
YOUTUBE_API_V3_URL=https://www.googleapis.com/youtube/v3
```

`YOUTUBE_API_KEY is provided in submit form`

### Running the app with Docker Compose

Start the application and PostgreSQL database:

```bash
$ docker-compose up --build
```

### Running the app without Docker

#### Requirements

- NodeJS >= v.18

#### Installation

```bash
$ yarn install
```

#### Before run the app

Start the application and PostgreSQL database:

```bash
$ docker-compose up postgres --build -d
```

#### Running the app

```bash
# development
$ yarn start
```

Application ready at `http://localhost:3000/swagger`

### After run the app

Terminate Docker containers

```bash
$ docker-compose down
```

## Testing

### Unit Test

#### Requirements

- NodeJS >= v.18
- Installed packages by `yarn install`

#### Running test

```bash
$ yarn test
```

#### Running test with coverage

```bash
$ yarn test:cov
```

### Integration test

#### Requirements

- NodeJS >= v.18
- Installed packages by `yarn install`
- Start `Postgres test` database by
  ```bash
  $ docker-compose up postgres_test --build -d
  ```

#### Running test

```bash
$ yarn test:e2e
```

### After run integration test

Terminate Docker container

```bash
$ docker-compose down postgres_test
```
