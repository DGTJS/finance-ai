import { Metadata } from "next";
import HelpClient from "../_components/help/help-client";

export const metadata: Metadata = {
  title: "Ajuda | Finance AI",
  description: "Central de ajuda e perguntas frequentes",
};

export default function HelpPage() {
  return <HelpClient />;
}

