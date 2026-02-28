"use client";

import React from "react";
import { useAuthenticator, View } from "@aws-amplify/ui-react";

function Footer() {
  const { toSignUp } = useAuthenticator();
  return (
    <View className="text-center mt-4">
      <p className="text-muted-foreground">
        Don&apos;t have an account?{" "}
        <button
          onClick={toSignUp}
          className="text-primary hover:underline bg-transparent border-none p-0"
        >
          Sign up here
        </button>
      </p>
    </View>
  );
}

export const signInComponents = {
  Footer,
};

export const signInFormFields = {
  username: {
    placeholder: "Enter your email",
    label: "Email",
    isRequired: true,
  },
  password: {
    placeholder: "Enter your password",
    label: "Password",
    isRequired: true,
  },
};

export default function SignInPage() {
  return null;
}
