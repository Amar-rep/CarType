"use client";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";
import {useAppDispatch, useAppSelector} from "@/lib/hooks";
import {registerUser} from "../../../lib/userSlice";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {useEffect, useState} from "react";
import {Loader2} from "lucide-react";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {status, error, token} = useAppSelector((state) => state.auth);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(registerUser({name, email, password}));
  };

  useEffect(() => {
    if (token) {
      router.push("/Login");
    }
  }, [token, router]);
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">sign up</CardTitle>
        <CardDescription>
          Create an account to start your typing journey.
        </CardDescription>
        {status === "failed" && error && (
          <p className="text-sm text-destructive mt-2">{error}</p>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="name"
              placeholder="username"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
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
            <Label htmlFor="password">Password</Label>
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
              "create an account"
            )}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          already have an account?{" "}
          <Link href="/Login" className="underline">
            login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
