import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kalendář & Diář | Nutriční Ambulance",
};

export default function CalendarLayout({ children }: { children: React.ReactNode }) {
  return children;
}
