"use client";

import { ArrowDownUp } from "lucide-react";
import { Button } from "./ui/button";
import {
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@radix-ui/react-dialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "./ui/dialog";
import { z } from "zod";
import {
  TransactionType,
  TransacationCategory,
  TransactionPaymentMethod,
} from "../generated/prisma";
import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/_components/ui/form";
import { Input } from "@/app/_components/ui/input";
import { Select, SelectTrigger, SelectValue } from "./ui/select";

const AddTransactionButton = () => {
  const formSchema = z.object({
    name: z.string().trim().min(1, {
      message: "O nome é obrigatorio",
    }),
    amount: z.string().trim().min(1, {
      message: "O nome é obrigatorio",
    }),
    type: z.nativeEnum(TransactionType, {
      error: "O tipo é obrigatório.",
    }),
    category: z.enum(TransacationCategory, {
      error: "A categoria é obrigatória.",
    }),
    PaymentMethod: z.enum(TransactionPaymentMethod, {
      error: "O método é obrigatória",
    }),
    data: z.date({
      error: "A data é obrigatária.",
    }),
  });
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      category: TransacationCategory.OTHER,
      data: new Date(),
      name: "",
      PaymentMethod: TransactionPaymentMethod.CASH,
      type: TransactionType.EXPENSE,
    },
  });
  const onSubmit = () => {};

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="rounded-full bg-green-600 text-white hover:bg-green-600">
            Adicionar Transação <ArrowDownUp />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogTitle>Adicionar Transação</DialogTitle>
          <DialogDescription>Insira as informações abaixo</DialogDescription>
          <Form {...form}>
            <form onSubmit={form.handleSubmit()} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Título" {...field} />
                    </FormControl>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <Input placeholder="R$ 0.000,00" {...field} />
                    </FormControl>
                    <Select>
                      <FormLabel>Tipo de transação</FormLabel>

                      <SelectTrigger className="w-[full]">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogHeader></DialogHeader>
              <DialogFooter>
                <Button variant="outline">Cancelar</Button>
                <Button className="text-white" type="submit">
                  Adicionar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddTransactionButton;
