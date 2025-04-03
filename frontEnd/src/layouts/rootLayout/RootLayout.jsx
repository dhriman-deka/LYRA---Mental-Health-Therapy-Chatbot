import { Link, Outlet } from "react-router-dom";
import { SignedIn, SignedOut, UserButton, useClerk, ClerkProvider } from "@clerk/clerk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./RootLayout.css";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Add more detailed debug information
console.log("Clerk Key:", PUBLISHABLE_KEY ? `Found key: ${PUBLISHABLE_KEY.substring(0, 10)}...` : "Missing key");
console.log("Environment:", import.meta.env.MODE);
console.log("API URL:", import.meta.env.VITE_API_URL || "Not set");

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
      {/* Add a debug footer in development mode */}
      {import.meta.env.DEV && (
        <div style={{ position: 'fixed', bottom: 0, right: 0, background: '#f0f0f0', padding: '5px', fontSize: '12px' }}>
          Debug: Auth enabled
        </div>
      )}
    </div>
  );
};

const RootLayout = () => {
  return (
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl="/"
      domain="clerk.io"
    >
      <QueryClientProvider client={queryClient}>
        <RootLayoutContent />
      </QueryClientProvider>
    </ClerkProvider>
  );
};

export default RootLayout;