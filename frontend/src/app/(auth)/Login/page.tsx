"use client";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";
import {useAppDispatch, useAppSelector} from "@/lib/hooks";
import {loginUser} from "../../../lib/userSlice";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Loader2} from "lucide-react";
import {useState, useEffect} from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();
  const dispatch = useAppDispatch();
  const {status, error, token} = useAppSelector((state) => state.auth);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginUser({email, password}));
  };
  useEffect(() => {
    // If login is successful (we have a token), redirect to homepage
    if (token) {
      router.push("/");
    }
  }, [token, router]);
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl text-primary tracking-wider">
          Login
        </CardTitle>
        <CardDescription>
          Enter your credentials to access your account.
        </CardDescription>
        {status === "failed" && error && (
          <p className="text-sm text-destructive mt-2">{error}</p>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email" className="tracking-wider">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password" className="tracking-wider">
                Password
              </Label>
              <Link href="#" className="ml-auto inline-block text-sm ">
                forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={status === "loading"}
          >
            {status === "loading" ? (
              <Loader2 className="animate-spin" />
            ) : (
              "login"
            )}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          dont have an account?{" "}
          <Link href="/signup" className="underline">
            sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
