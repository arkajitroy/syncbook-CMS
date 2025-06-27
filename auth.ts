import NextAuth, { User } from "next-auth";
import { compare } from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";


// Implementa autenticación con credenciales (email y contraseña) en una aplicación Next.js,
// utilizando Drizzle ORM para acceder a la base de datos y bcryptjs para verificar la contraseña.

export const { 
  handlers,             // Contiene los endpoints de autenticación (/api/auth/...).
  signIn,               // Función para iniciar sesión manualmente.
  signOut,              // Función para cerrar sesión manualmente.
  auth                  // Middleware de autenticación.
} = NextAuth({
  session: {                                                     // Configuración de la sesión.
    strategy: "jwt",                                             // Usa JSON Web Tokens (JWT) en lugar de sesiones en base de datos.
  },
  providers: [                                                   // Configuración de proveedores de autenticación.
    CredentialsProvider({                                        // Proveedor de credenciales.
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {     // 1º Valida que se envíen email y password.
          return null;
        }

        const user = await db                                    // 2º Consulta el usuario en la base de datos usando Drizzle
          .select()
          .from(users)
          .where(eq(users.email, credentials.email.toString()))
          .limit(1);

        if (user.length === 0) return null;

        const isPasswordValid = await compare(                  // 3º Compara la contraseña ingresada con la de la base de datos usando bcryptjs
          credentials.password.toString(),
          user[0].password,
        );

        if (!isPasswordValid) return null;

        return {                                                // 4º Si todo está bien, retorna un objeto con los datos del usuario
          id: user[0].id.toString(),
          email: user[0].email,
          name: user[0].fullName,
        } as User;
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",                                         // Página personalizada para iniciar sesión.
  },
  callbacks: {
    async jwt({ token, user }) {                                // Callback para crear el token JWT. El token se genera la primera vez cuando el usuario inicia sesión
      if (user) {                                               // En solicitudes futuras, el token ya existe y solo se actualiza si es necesario.
        token.id = user.id;                                     // Si el usuario está autenticado, se agrega el ID del usuario al token JWT.
        token.name = user.name;                                 // y el nombre al token.
      }

      return token;
    },
    async session({ session, token }) {                         // Callback para actualizar la sesión.
      if (session.user) {                                       // Si hay un usuario en la sesión
        session.user.id = token.id as string;                   // se agrega el ID del token a la sesión
        session.user.name = token.name as string;               // y el nombre del token a la sesión.
      }

      return session;
    },
  },
});