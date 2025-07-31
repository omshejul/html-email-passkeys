
## Steps to set up your new clean database:

1. **Run the database migrations** to create all the tables:
   ```bash
   pnpm prisma migrate deploy
   ```

2. **Generate the Prisma client** (if not already done):
   ```bash
   pnpm prisma generate
   ```

3. **Verify the database connection** by checking if the tables were created:
   ```bash
   pnpm prisma db pull
   ```

## What these commands do:

- `pnpm prisma migrate deploy` - Applies all existing migrations to your new database, creating the User, Account, Session, VerificationToken, and Authenticator tables
- `pnpm prisma generate` - Generates the Prisma client based on your schema
- `pnpm prisma db pull` - Pulls the current database schema to verify everything was created correctly

## Optional but recommended:

4. **Seed the database** (if you have seed data):
   ```bash
   pnpm prisma db seed
   ```

5. **Open Prisma Studio** to visually inspect your database:
   ```bash
   pnpm prisma studio
   ```

After running these commands, your new database will have all the necessary tables for your authentication system (NextAuth.js) and passkey functionality. The migration will create the exact same schema structure as defined in your `schema.prisma` file.

