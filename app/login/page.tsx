import Image from "next/image";
import { Button } from "../_components/ui/button";
import React from "react";
import { FcGoogle } from "react-icons/fc";
import { SignInButton } from "@clerk/nextjs";

const LoginPage = () => {
  return (
    <div className="grid h-full grid-cols-2">
      <div className="mx-auto flex h-full max-w-[550px] flex-col justify-center p-8">
        <Image
          src="/logo.svg"
          width={173}
          height={39}
          alt="Finance AI"
          className="mb-8"
        />
        <h1 className="mb-3 text-4xl font-bold">Bem vindo</h1>
        <p>
          A Finance AI é uma plataforma de gestão financeira que utiliza IA para
          monitorar suas movimentações, e oferecer insights personalizados,
          facilitando o controle do seu orçamento.
        </p>
        <SignInButton>
          <Button variant={"outline"} className="mt-6">
            <FcGoogle />
            Entrar com Google
          </Button>
        </SignInButton>
      </div>
      <div className="relative h-full w-full">
        <Image
          src="/login.png"
          alt="Imagem de Login"
          fill
          className="object-cover"
        />
      </div>
    </div>
  );
};

export default LoginPage;
