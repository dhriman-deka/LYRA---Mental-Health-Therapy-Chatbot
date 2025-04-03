import { SignIn } from "@clerk/clerk-react";
import "./signInPage.css";

const SignInPage = () => {
  return (
    <div className="signInPage">
      <h1>Welcome to LYRA</h1>
      <SignIn
        path="/sign-in"
        signUpUrl="/sign-up"
        redirectUrl="/dashboard"
        appearance={{
          elements: {
            card: "cl-card",
            headerTitle: "cl-headerTitle",
            formButtonPrimary: "cl-button-primary",
            socialButtonsIconButton: "cl-socialButtonsIconButton"
          }
        }}
      />
    </div>
  );
};

export default SignInPage;