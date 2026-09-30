import { AuthForm } from "@/components/auth-form";
import { PublicOnly } from "@/components/public-only";

export default function LoginPage() {
  return <PublicOnly><AuthForm mode="login" /></PublicOnly>;
}
