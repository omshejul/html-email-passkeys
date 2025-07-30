import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient().$extends({
    query: {
      $allOperations({ operation, args, query }) {
        const start = performance.now();
        return query(args).finally(() => {
          const end = performance.now();
          console.log(`${operation} took ${end - start}ms`);
        });
      },
    },
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
