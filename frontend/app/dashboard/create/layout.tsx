import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Website",
};

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
