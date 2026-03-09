import { SettingsFormData, settingsSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Form } from "./ui/form";
import { CustomFormField } from "./FormField";
import { Button } from "./ui/button";
import { Pencil } from "lucide-react";

const SettingsForm = ({
  initialData,
  onSubmit,
  userType,
}: SettingsFormProps) => {
  const [editMode, setEditMode] = useState(false);
  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialData,
  });

  const toggleEditMode = () => {
    setEditMode(!editMode);
    if (editMode) form.reset(initialData);
  };

  const handleSubmit = async (data: SettingsFormData) => {
    await onSubmit(data);
    setEditMode(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm font-semibold text-gray-700">
          Profile Information
        </p>
        <button
          type="button"
          onClick={toggleEditMode}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <Pencil className="w-3 h-3" />
          {editMode ? "Cancel" : "Edit"}
        </button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
          <CustomFormField name="name" label="Full Name" disabled={!editMode} />
          <CustomFormField
            name="email"
            label="Email Address"
            type="email"
            disabled={!editMode}
          />
          <CustomFormField
            name="phoneNumber"
            label="Phone Number"
            disabled={!editMode}
          />

          {editMode && (
            <div className="pt-2">
              <Button
                type="submit"
                className="w-full bg-primary-700 text-white hover:bg-primary-600 rounded-xl py-2.5"
              >
                Save Changes
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
};

export default SettingsForm;
