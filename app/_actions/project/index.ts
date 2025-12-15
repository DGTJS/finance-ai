"use server";

import { auth } from "@/auth";
import { db } from "@/app/_lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const projectSchema = z.object({
  clientName: z.string().min(1, "Nome do cliente é obrigatório"),
  projectName: z.string().optional().nullable(),
  hourlyRate: z.number().positive().optional().nullable(),
  status: z.enum(["ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"]).optional(),
  notes: z.string().optional().nullable(),
});

type ProjectInput = z.infer<typeof projectSchema>;

async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Não autorizado");
  }
  return session.user.id;
}

export async function createProject(data: ProjectInput) {
  try {
    const userId = await getUserId();
    
    // Verificar se o modelo existe
    if (!db.project) {
      return {
        success: false,
        error: "Prisma Client não foi regenerado. Execute: npx prisma generate",
      };
    }
    
    const validatedData = projectSchema.parse(data);

    const project = await db.project.create({
      data: {
        userId,
        clientName: validatedData.clientName,
        projectName: validatedData.projectName || null,
        hourlyRate: validatedData.hourlyRate || null,
        status: validatedData.status || "ACTIVE",
        notes: validatedData.notes || null,
      },
    });

    revalidatePath("/entrepreneur");
    return { success: true, data: project };
  } catch (error) {
    console.error("Erro ao criar projeto:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao criar projeto",
    };
  }
}

export async function updateProject(id: string, data: Partial<ProjectInput>) {
  try {
    const userId = await getUserId();
    
    // Verificar se o modelo existe
    if (!db.project) {
      return {
        success: false,
        error: "Prisma Client não foi regenerado. Execute: npx prisma generate",
      };
    }
    
    const validatedData = projectSchema.partial().parse(data);

    const existingProject = await db.project.findUnique({
      where: { id },
    });

    if (!existingProject || existingProject.userId !== userId) {
      return {
        success: false,
        error: "Projeto não encontrado ou sem permissão",
      };
    }

    const project = await db.project.update({
      where: { id },
      data: validatedData,
    });

    revalidatePath("/entrepreneur");
    return { success: true, data: project };
  } catch (error) {
    console.error("Erro ao atualizar projeto:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao atualizar projeto",
    };
  }
}

export async function deleteProject(id: string) {
  try {
    const userId = await getUserId();

    // Verificar se o modelo existe
    if (!db.project) {
      return {
        success: false,
        error: "Prisma Client não foi regenerado. Execute: npx prisma generate",
      };
    }

    const project = await db.project.findUnique({
      where: { id },
    });

    if (!project || project.userId !== userId) {
      return {
        success: false,
        error: "Projeto não encontrado ou sem permissão",
      };
    }

    await db.project.delete({
      where: { id },
    });

    revalidatePath("/entrepreneur");
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar projeto:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao deletar projeto",
    };
  }
}

export async function getProjects() {
  try {
    const userId = await getUserId();

    // Verificar se o modelo existe
    if (!db.project) {
      return {
        success: false,
        error: "Prisma Client não foi regenerado. Execute: npx prisma generate",
        data: [],
      };
    }

    const projects = await db.project.findMany({
      where: {
        userId,
      },
      include: {
        _count: {
          select: {
            periods: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: projects,
    };
  } catch (error) {
    console.error("Erro ao buscar projetos:", error);
    return {
      success: false,
      error: "Erro ao buscar projetos",
      data: [],
    };
  }
}

