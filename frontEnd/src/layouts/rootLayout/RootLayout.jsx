import { Link, Outlet } from "react-router-dom";
import { SignedIn, SignedOut, UserButton, useClerk, ClerkProvider } from "@clerk/clerk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./RootLayout.css";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

const queryClient = new QueryClient();

const RootLayoutContent = () => {
  const { openSignIn } = useClerk();

  return (
    <div className="rootLayout">
      <header>
        <Link to="/" className="header-logo">
          <img src="/logo.png" alt="Logo" />
          <span>LYRA</span>
        </Link>

        <div className="user">
          <SignedOut>
            <button 
              onClick={() => openSignIn()}
              className="sign-in-button"
            >
              Sign In
            </button>
          </SignedOut>
          <SignedIn>
            <UserButton 
              appearance={{
                elements: {
                  userButtonAvatarBox: "user-avatar-box",
                  userButtonTrigger: "user-button-trigger",
                  userButtonPopoverCard: "user-popover-card",
                  userButtonPopoverActions: "user-popover-actions",
                  userButtonPopoverActionButton: "user-popover-action-button",
                  userPreviewMainIdentifier: "user-preview-identifier",
                  userPreviewSecondaryIdentifier: "user-preview-secondary"
                }
              }}
            />
          </SignedIn>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

const RootLayout = () => {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <QueryClientProvider client={queryClient}>
        <RootLayoutContent />
      </QueryClientProvider>
    </ClerkProvider>
  );
};

export default RootLayout;