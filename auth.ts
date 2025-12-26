import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/app/_lib/prisma";

// Garantir que a URL base seja localhost:3000 em desenvolvimento
const getBaseUrl = () => {
  // Em produção, usar variáveis de ambiente
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // Em produção, usar NEXTAUTH_URL se configurada
  if (process.env.NODE_ENV === "production" && process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  // Em desenvolvimento, usar localhost:3000 por padrão
  // O trustHost: true garantirá que use a origem correta da requisição
  return "http://localhost:3000";
};

export const { auth, handlers, signIn, signOut } = NextAuth({
  secret:
    process.env.NEXTAUTH_SECRET ||
    "Upp0lfMf+K7Sj0UG2A5SCfezMwI34FE+idJrc6l6mZI=",
  trustHost: true,
  basePath: "/api/auth",
  baseUrl: getBaseUrl(),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // MODO DE TESTE: Buscar usuário de teste do banco
        if (
          credentials.email === "teste@finance.ai" &&
          credentials.password === "123456"
        ) {
          try {
            const testUser = await db.user.findUnique({
              where: { email: "teste@finance.ai" },
            });

            if (testUser) {
              return {
                id: testUser.id,
                email: testUser.email,
                name: testUser.name,
                image: testUser.image,
              };
            }
          } catch (error: any) {
            console.error("❌ Erro ao buscar usuário de teste:", error);
            if (error.code === "P1001" || error.code === "P1000") {
              console.error("❌ Erro de conexão com banco de dados!");
              console.error(
                "💡 Verifique se o MySQL está rodando e se a DATABASE_URL está correta.",
              );
            }
            return null;
          }

          // Fallback caso o banco não esteja acessível
          return null;
        }

        // Tentar buscar no banco de dados
        try {
          const user = await db.user.findUnique({
            where: {
              email: credentials.email as string,
            },
          });

          if (!user || !user.password) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password,
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error: any) {
          console.error("❌ Erro ao buscar usuário:", error);
          if (error.code === "P1001" || error.code === "P1000") {
            console.error("❌ Erro de conexão com banco de dados!");
            console.error(
              "💡 Verifique se o MySQL está rodando e se a DATABASE_URL está correta.",
            );
          } else if (error.code === "P1003") {
            console.error("❌ Erro: Tabelas não encontradas!");
            console.error("💡 Execute: npx prisma migrate dev");
          }
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Se for login com OAuth (Google), criar/atualizar usuário no banco
        if (account?.provider === "google" && user.email) {
          const existingUser = await db.user.findUnique({
            where: { email: user.email },
          });

          if (existingUser) {
            // Atualizar informações do usuário
            await db.user.update({
              where: { email: user.email },
              data: {
                name: user.name,
                image: user.image,
              },
            });
            console.log("✅ Usuário Google atualizado:", user.email);
          } else {
            // Criar novo usuário
            const newUser = await db.user.create({
              data: {
                email: user.email,
                name: user.name,
                image: user.image,
                emailVerified: new Date(),
              },
            });
            console.log("✅ Novo usuário Google criado:", newUser.email);
            // Atualizar o ID do usuário para o ID do banco
            user.id = newUser.id;
          }
        }

        return true;
      } catch (error: any) {
        console.error("❌ Erro no callback signIn:", error);
        if (error.code === "P1001" || error.code === "P1000") {
          console.error("❌ Erro de conexão com banco de dados!");
          console.error(
            "💡 Verifique se o MySQL está rodando e se a DATABASE_URL está correta.",
          );
        } else if (error.code === "P1003") {
          console.error("❌ Erro: Tabelas não encontradas!");
          console.error("💡 Execute: npx prisma migrate dev");
        }
        return true; // Permitir login mesmo se houver erro
      }
    },
    async jwt({ token, user, account, trigger }) {
      // Se é um novo login, garantir que o ID vem do banco
      if (user) {
        try {
          const dbUser = await db.user.findUnique({
            where: { email: user.email! },
            select: { id: true, email: true, name: true, image: true },
          });

          if (dbUser) {
            token.id = dbUser.id;
            token.email = dbUser.email;
            token.name = dbUser.name;
            // NÃO armazenar a imagem no token para evitar cookies muito grandes (erro 431)
            // A imagem será buscada do banco no callback session
            // token.image = dbUser.image; // REMOVIDO
            if (process.env.NODE_ENV === "development") {
              console.log(
                "✅ Token JWT criado com ID do banco:",
                dbUser.id,
                "para",
                dbUser.email,
              );
            }
          } else {
            console.warn("⚠️ Usuário não encontrado no banco:", user.email);
            token.id = user.id;
            token.email = user.email || undefined;
            token.name = user.name || undefined;
            // token.image = user.image || undefined; // REMOVIDO
          }
        } catch (error: any) {
          console.error("❌ Erro ao buscar usuário para JWT:", error);
          if (error.code === "P1001" || error.code === "P1000") {
            console.error("❌ Erro de conexão com banco de dados!");
          }
          // Em caso de erro, usar dados do user para não quebrar o login
          token.id = user.id;
          token.email = user.email || undefined;
          token.name = user.name || undefined;
          // token.image = user.image || undefined; // REMOVIDO - não armazenar imagem no token
          (token as any).lastUpdate = Date.now();
        }
      }

      // NÃO atualizar o token periodicamente para evitar cookies muito grandes
      // A imagem será buscada diretamente do banco quando necessário (via session)
      // Isso evita o erro 431 (Request Header Fields Too Large)

      return token;
    },
    async session({ session, token }) {
      // Buscar dados do usuário do banco para pegar a imagem atualizada
      // NÃO armazenamos a imagem no token para evitar cookies muito grandes (erro 431)
      if (token.id) {
        try {
          const dbUser = await db.user.findUnique({
            where: { id: token.id as string },
            select: { id: true, email: true, name: true, image: true },
          });

          if (dbUser) {
            if (session.user) {
              session.user.id = dbUser.id;
              session.user.email = dbUser.email;
              session.user.name = dbUser.name;
              // Apenas incluir a imagem se não for muito grande (máximo 50KB base64 para evitar erro 431)
              if (dbUser.image && dbUser.image.length <= 50 * 1024) {
                session.user.image = dbUser.image;
              } else {
                // Se a imagem for muito grande, não incluir na sessão
                // A imagem será buscada diretamente do banco quando necessário
                session.user.image = null;
              }
            } else {
              session.user = {
                id: dbUser.id,
                email: dbUser.email,
                name: dbUser.name,
                image:
                  dbUser.image && dbUser.image.length <= 50 * 1024
                    ? dbUser.image
                    : null,
              };
            }
          } else {
            // Fallback para dados do token
            if (session.user) {
              session.user.id = token.id as string;
              session.user.email = (token.email as string) || "";
              session.user.name = (token.name as string) || null;
              session.user.image = null; // Não incluir imagem do token para evitar cookies grandes
            }
          }
        } catch (error: any) {
          console.error("❌ Erro ao buscar usuário para sessão:", error);
          // Fallback para dados do token sem imagem
          if (session.user) {
            session.user.id = token.id as string;
            session.user.email = (token.email as string) || "";
            session.user.name = (token.name as string) || null;
            session.user.image = null;
          }
        }
      }
      return session;
    },
  },
});
