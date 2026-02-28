"use client";

import React, { useEffect } from "react";
import { Amplify } from "aws-amplify";
import {
  Authenticator,
  Heading,
  useAuthenticator,
  View,
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { useRouter, usePathname } from "next/navigation";
import { signInComponents, signInFormFields } from "./signin/page";
import { signUpComponents, signUpFormFields } from "./signup/page";

// Configure Amplify
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID!,
      userPoolClientId:
        process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID!,
    },
  },
});

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthenticator((context) => [context.user]);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname.match(/^\/(signin|signup)$/);
  const isDashboardPage =
    pathname.startsWith("/manager") || pathname.startsWith("/tenants");

  // Redirect authenticated users away from auth pages
  useEffect(() => {
    if (user && isAuthPage) {
      router.push("/");
    }
  }, [user, isAuthPage, router]);

  // Allow access to public pages without authentication
  if (!isAuthPage && !isDashboardPage) {
    return <>{children}</>;
  }

  const components = {
    Header() {
      return (
        <View className="mt-4 mb-7">
          <Heading level={3} className="!text-2xl !font-bold">
            RENT
            <span className="text-secondary-500 font-light hover:!text-primary-300">
              IFUL
            </span>
          </Heading>
          <p className="text-muted-foreground mt-2">
            <span className="font-bold">Welcome!</span> Please sign in to
            continue
          </p>
        </View>
      );
    },
    SignIn: signInComponents,
    SignUp: signUpComponents,
  };

  const formFields = {
    signIn: signInFormFields,
    signUp: signUpFormFields,
  };

  return (
    <div className="h-full bg-white">
      <Authenticator
        initialState={pathname.includes("signup") ? "signUp" : "signIn"}
        components={components}
        formFields={formFields}
      >
        {() => <>{children}</>}
      </Authenticator>
    </div>
  );
};

export default AuthProvider;
