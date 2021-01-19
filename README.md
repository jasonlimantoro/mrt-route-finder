# MRT Route Finder

### This project is available at https://mrt-route-finder.herokuapp.com/graphql

![](assets/demo.gif)

## Tech stack

- Node.js
- Typescript
- GraphQL
- Jest

## Prerequisites

- `node` 12.x or above
- `yarn` 1.2x or above

## Getting Started

1. Install project dependencies

```
yarn --pure-lockfile
```

2. Start Server

```
yarn start
```

> This will start server at http://localhost:4000

3. Navigate to http://localhost:4000/graphql to access the GraphQL playground

## How To's

> Just paste the shown queries below in the playground and click play icon to run the query.

1. Query best route from station A to station B with minimum information without time cost

```graphql
{
  route(source: "EW28", target: "NS2") {
    ... on RouteResponseSuccess {
      topRoute {
        durationMinute
        stops
      }
    }
    ... on RouteResponseError {
      message
    }
  }
}
```

2. Query best route from station A to station B with instruction without time cost

```graphql
{
  route(source: "EW28", target: "NS2") {
    ... on RouteResponseSuccess {
      topRoute {
        durationMinute
        numberOfStops
        stops
        instructions {
          text
        }
      }
    }
    ... on RouteResponseError {
      message
    }
  }
}
```

3. Query best route from station A to Station B with time cost without instruction

```graphql
{
  route(source: "EW16", target: "NS23", startTime: "2021-01-14T06:40+08:00") {
    ... on RouteResponseSuccess {
      topRoute {
        arrivalTime
        durationMinute
        numberOfStops
        stops
      }
    }
    ... on RouteResponseError {
      message
    }
  }
}
```

4. Query best route from station A to station B with time cost and instruction

```graphql
{
  route(source: "EW16", target: "NS23", startTime: "2021-01-14T06:40+08:00") {
    ... on RouteResponseSuccess {
      topRoute {
        arrivalTime
        durationMinute
        numberOfStops
        stops
        instructions {
          text
          meta {
            cost
            currentTime
          }
        }
      }
    }
    ... on RouteResponseError {
      message
    }
  }
}
```

5. Query best route **and** alternative routes (up to 4) with detailed instruction at every routes

```graphql
{
  route(source: "EW16", target: "NS23", startTime: "2021-01-14T06:40+08:00") {
    ... on RouteResponseSuccess {
      topRoute {
        arrivalTime
        durationMinute
        numberOfStops
        stops
        instructions {
          text
          meta {
            cost
            currentTime
          }
        }
      }
      alternativeRoutes(take: 4) {
        arrivalTime
        durationMinute
        numberOfStops
        stops
        instructions {
          text
          meta {
            cost
            currentTime
          }
        }
      }
    }
    ... on RouteResponseError {
      message
    }
  }
}
```

## Test

1. Run test with jest

```
yarn test
```
