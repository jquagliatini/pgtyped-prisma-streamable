import { inspect } from 'node:util';
import { Pool } from "pg";
import Cursor from "pg-cursor";

import {
  Controller,
  Get,
  Injectable,
  Logger,
  Module,
  OnApplicationShutdown,
} from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { PreparedQuery } from "@pgtyped/runtime";
import { processSQLQueryIR } from "@pgtyped/runtime";
import { IDatabaseConnection } from "@pgtyped/runtime/lib/tag";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import { getAllClients } from "./src/clients-finder.raw-query";

@Injectable()
class PgPool extends Pool {
  constructor() {
    super({ connectionString: process.env.DATABASE_URL });
  }
}

@Injectable()
class PgTyped implements IDatabaseConnection {
  constructor(private readonly pool: PgPool) {}

  async query(query: string, bindings: unknown[]) {
    const client = await this.pool.connect();
    return client.query(query, bindings);
  }
}

@Injectable()
class StreamablePgTyped {
  constructor(private readonly pool: PgPool) {}

  run<TIn, TOut>(statement: PreparedQuery<TIn, TOut>) {
    const pool = this.pool;
    let size = 100;

    return {
      by(_size: number) {
        size = _size;

        return {
          async *with(params: TIn) {
            const { query, bindings } = processSQLQueryIR(
              (statement as any).queryIR,
              params as any
            );

            const client = await pool.connect();
            const cursor = client.query(new Cursor<TOut>(query, bindings));

            let rows;
            do {
              rows = await cursor.read(size);
              if (rows.length > 0) yield rows;
            } while (rows.length > 0);

            await cursor.close();
            await client.release();
          },
        };
      },
    };
  }
}

@Injectable()
class RawSqlService {
  constructor(private readonly pgTyped: PgTyped) {}

  async run<TIn, TOut>(preparedStatement: PreparedQuery<TIn, TOut>) {
    return {
      with: (params: TIn) => preparedStatement.run(params, this.pgTyped),
    };
  }
}

@Injectable()
class PrismaService extends PrismaClient implements OnApplicationShutdown {
  constructor(pool: PgPool) {
    super({
      adapter: new PrismaPg(pool),
    });
  }

  async onApplicationShutdown() {
    await this.$disconnect();
  }
}

@Controller("clients")
class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(private streamable: StreamablePgTyped) {}

  @Get()
  async getClients() {
    const clients = this.streamable.run(getAllClients).by(10_000).with();
    for await (const clientsPage of clients) {
      this.logger.debug(inspect(clientsPage[0]));
    }

    this.logger.debug("done");
  }
}

@Module({
  providers: [PgPool, PgTyped, RawSqlService, PrismaService, StreamablePgTyped],
  controllers: [AppController],
})
class AppModule {}

main().catch(console.error);
async function main() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
