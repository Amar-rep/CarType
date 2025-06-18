import React from "react";

// This layout component automatically receives two props from Next.js:
// 1. `children`: The actual page component that will be rendered (e.g., your Dashboard page).
// 2. `params`: An object containing the dynamic route segments. Since this layout
//    is part of the `/[userId]` route, `params` will contain `userId`.

export default function MainLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: {userId: string};
}) {
  return (
    // This outer div creates a vertical flex container that takes up the full screen height.
    // This is a common pattern for ensuring the footer stays at the bottom.
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white">
      {/* 
        We render the Header component at the top of every page in this layout.
        Crucially, we pass the `userId` from the URL params down to the Header,
        so it can construct the correct navigation links (e.g., "/[userId]/dashboard").
      */}

      {/* 
        The <main> element is where the page-specific content will be injected.
        The `flex-1` class makes it expand to fill all available vertical space,
        pushing the footer down. `container`, `mx-auto`, and `px-6` handle centering
        and horizontal padding. `flex flex-col` is added to allow the child page
        (like the dashboard) to use flexbox for its own full-height layout.
      */}
      <main className="flex flex-col flex-1 container mx-auto px-4 py-6">
        {children}
      </main>

      {/* 
        A simple footer that will appear at the bottom of the dashboard, game page, etc.
      */}
      <footer className="text-center p-4 text-xs text-zinc-500 border-t border-zinc-800">
        © {new Date().getFullYear()} Meowser Inc. All rights reserved.
      </footer>
    </div>
  );
}
