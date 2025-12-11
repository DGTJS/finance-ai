"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/app/_lib/utils";
import { Calendar } from "@/app/_components/ui/calendar";
import { Button } from "@/app/_components/ui/button";
import { ptBR } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/_components/ui/popover";

interface DatePickerFormProps {
  value?: Date;
  onChange: (date?: Date) => void;
}

export function DatePickerForm({ value, onChange }: DatePickerFormProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full pl-3 text-left font-normal",
            !value && "text-muted-foreground",
          )}
        >
          {value ? (
            format(value, "PPP", { locale: ptBR })
          ) : (
            <span>Selecione uma data</span>
          )}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          locale={ptBR}
          captionLayout="dropdown"
        />
      </PopoverContent>
    </Popover>
  );
}
