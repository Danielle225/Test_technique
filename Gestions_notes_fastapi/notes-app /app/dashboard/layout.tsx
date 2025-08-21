import { IsAuthenticated } from "@/lib/auth_check"
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
   <IsAuthenticated>
      {children}
   </IsAuthenticated>
   )
}
