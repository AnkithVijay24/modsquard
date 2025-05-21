import { User as PrismaUser, Profile as PrismaProfile } from '@prisma/client';

declare global {
  interface User extends PrismaUser {
    profile?: Profile | null;
  }

  interface Profile extends PrismaProfile {}
} 