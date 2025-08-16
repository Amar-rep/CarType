// src/app/(auth)/layout.tsx

export default function AuthLayout({children}: {children: React.ReactNode}) {
  // This layout will apply to all pages inside the (auth) group
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      {children}
    </main>
  );
}
