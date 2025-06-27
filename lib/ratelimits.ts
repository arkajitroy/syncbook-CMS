import { Ratelimit } from "@upstash/ratelimit";;
import redis from "../database/redis"

const ratelimit = new Ratelimit({  // Limite de llamadas a la API Redis
  redis,
  limiter: Ratelimit.fixedWindow(5, "1m"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});

export default ratelimit;