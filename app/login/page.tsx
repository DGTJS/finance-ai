import Image from "next/image";

const LoginPage = () => {
  return (
    <div className="grid h-full grid-cols-2">
      <div className="mx-auto flex h-full flex-col justify-center p-8">
        <Image src="/logo.svg" width={173} height={39} alt="Finance AI" />
        <h1>Bem vindo</h1>
        <p>
          A Finance AI é uma plataforma de gestão financeira que utiliza IA para
          monitorar suas movimentações, e oferecer insights personalizados,
          facilitando o controle do seu orçamento.
        </p>
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
