import {NextFunction, Request, Response} from "express";
import client from "prom-client";

const requestCounter = new client.Counter({
  name: "request_count",
  help: "Total request count",
  labelNames: ["method", "route", "status_code"],
});

const activeUserGauge = new client.Gauge({
  name: "active_users",
  help: "Total number of users whose request hasnt yet resolved",
  labelNames: ["method", "route"],
});

const httpRequestDurationMicroseconds = new client.Histogram({
  name: "http_request_duration_ms",
  help: "Duration of HTTP requests in ms",
  labelNames: ["method", "route", "code"],
  buckets: [0.1, 5, 15, 50, 100, 300, 500, 1000, 3000, 5000], // Define your own buckets here
});

// export function requestCountMiddleware(
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) {
//   const startTime = Date.now();

//   res.on("close", () => {
//     const endTime = Date.now();
//     console.log(`Time taken: ${endTime - startTime}ms`);
//     requestCounter.inc({
//       method: req.method,
//       route: req.route ? req.route.path : req.path,
//       status_code: res.statusCode,
//     });
//   });
//   next();
// }

export function activeUserMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  activeUserGauge.inc({
    method: req.method,
    route: req.route ? req.route.path : req.path,
  });

  res.on("close", () => {
    activeUserGauge.dec({
      method: req.method,
      route: req.route ? req.route.path : req.path,
    });
  });

  next();
}

export function httpRequestDurationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const startTime = Date.now();
  res.on("close", () => {
    const endTime = Date.now();
    console.log(`Time taken: ${endTime - startTime}ms`);
    requestCounter.inc({
      method: req.method,
      route: req.route ? req.route.path : req.path,
      status_code: res.statusCode,
    });

    httpRequestDurationMicroseconds.observe(
      {
        method: req.method,
        route: req.route ? req.route.path : req.path,
        code: res.statusCode,
      },
      endTime - startTime
    );
  });
  next();
}
