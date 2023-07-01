import { Snowflake } from "@theinternetfolks/snowflake";

export default function generateSnowflake(): string {
  return Snowflake.generate({ timestamp: 1649157035498, shard_id: 4 });
}
