import { AuthForm } from "@/components/auth-form";
import { PublicOnly } from "@/components/public-only";

export default function RegisterPage() {
  return <PublicOnly><AuthForm mode="register" /></PublicOnly>;
}
