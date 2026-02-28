"use client";

import React from "react";
import {
  Authenticator,
  Radio,
  RadioGroupField,
  useAuthenticator,
  View,
} from "@aws-amplify/ui-react";

function FormFields() {
  const { validationErrors } = useAuthenticator();

  return (
    <>
      <Authenticator.SignUp.FormFields />
      <RadioGroupField
        legend="Role"
        name="custom:role"
        errorMessage={validationErrors?.["custom:role"]}
        hasError={!!validationErrors?.["custom:role"]}
        isRequired
      >
        <Radio value="tenant">Tenant</Radio>
        <Radio value="manager">Manager</Radio>
      </RadioGroupField>
    </>
  );
}

function Footer() {
  const { toSignIn } = useAuthenticator();
  return (
    <View className="text-center mt-4">
      <p className="text-muted-foreground">
        Already have an account?{" "}
        <button
          onClick={toSignIn}
          className="text-primary hover:underline bg-transparent border-none p-0"
        >
          Sign in
        </button>
      </p>
    </View>
  );
}

export const signUpComponents = {
  FormFields,
  Footer,
};

export const signUpFormFields = {
  username: {
    order: 1,
    placeholder: "Choose a username",
    label: "Username",
    isRequired: true,
  },
  email: {
    order: 2,
    placeholder: "Enter your email address",
    label: "Email",
    isRequired: true,
  },
  password: {
    order: 3,
    placeholder: "Create a password",
    label: "Password",
    isRequired: true,
  },
  confirm_password: {
    order: 4,
    placeholder: "Confirm your password",
    label: "Confirm Password",
    isRequired: true,
  },
};

export default function SignUpPage() {
  return null;
}
