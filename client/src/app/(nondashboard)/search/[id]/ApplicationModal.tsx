"use client";

import { CustomFormField } from "@/components/FormField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ApplicationFormData, applicationSchema } from "@/lib/schemas";
import {
  useCreateApplicationMutation,
  useGetAuthUserQuery,
  useGetPropertyQuery,
} from "@/state/api";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useMemo } from "react";
import { useForm } from "react-hook-form";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toInputDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

function calculatePriceBreakdown(
  pricePerMonth: number,
  startDate: Date,
  endDate: Date,
) {
  const days = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  const dailyRate = pricePerMonth / 30;

  let discountPct = 0;
  if (days >= 30) discountPct = 10;
  else if (days >= 7) discountPct = 5;

  const subtotal = dailyRate * days;
  const discountAmount = subtotal * (discountPct / 100);
  const total = Math.round((subtotal - discountAmount) * 100) / 100;

  return { days, dailyRate, discountPct, discountAmount, subtotal, total };
}

// ─── Component ────────────────────────────────────────────────────────────────

const ApplicationModal = ({
  isOpen,
  onClose,
  propertyId,
}: ApplicationModalProps) => {
  const [createApplication] = useCreateApplicationMutation();
  const { data: authUser } = useGetAuthUserQuery();
  const { data: property } = useGetPropertyQuery(propertyId);

  const today = new Date();
  const todayStr = toInputDateString(today);
  const defaultEndDate = new Date(today);
  defaultEndDate.setDate(today.getDate() + 2);
  const defaultEndStr = toInputDateString(defaultEndDate);

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      message: "",
      startDate: todayStr,
      endDate: defaultEndStr,
      totalPrice: 0,
    },
  });

  const watchedStart = form.watch("startDate");
  const watchedEnd = form.watch("endDate");

  // Live price breakdown — recalculates whenever dates change
  const breakdown = useMemo(() => {
    if (!property?.pricePerMonth || !watchedStart || !watchedEnd) return null;

    const start = new Date(watchedStart);
    const end = new Date(watchedEnd);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start)
      return null;

    const days = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (days < 2) return null;

    return calculatePriceBreakdown(property.pricePerMonth, start, end);
  }, [property?.pricePerMonth, watchedStart, watchedEnd]);

  // Keep hidden totalPrice field in sync
  React.useEffect(() => {
    if (breakdown) form.setValue("totalPrice", breakdown.total);
  }, [breakdown, form]);

  const onSubmit = async (data: ApplicationFormData) => {
    if (!authUser || authUser.userRole !== "tenant") {
      console.error(
        "You must be logged in as a tenant to submit an application",
      );
      return;
    }

    await createApplication({
      ...data,
      applicationDate: new Date().toISOString(),
      status: "Pending",
      propertyId,
      tenantCognitoId: authUser.cognitoInfo.userId,
    });

    onClose();
  };

  // Compute dynamic min end date from the current start value
  const dynamicMinEnd = useMemo(() => {
    if (!watchedStart) return defaultEndStr;
    const s = new Date(watchedStart);
    s.setDate(s.getDate() + 2);
    return toInputDateString(s);
  }, [watchedStart]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-lg">
        <DialogHeader className="mb-4">
          <DialogTitle>Submit Application for this Property</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Personal details */}
            <CustomFormField
              name="name"
              label="Name"
              type="text"
              placeholder="Enter your full name"
            />
            <CustomFormField
              name="email"
              label="Email"
              type="email"
              placeholder="Enter your email address"
            />
            <CustomFormField
              name="phoneNumber"
              label="Phone Number"
              type="text"
              placeholder="Enter your phone number"
            />

            {/* Stay duration */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check-in Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        min={todayStr}
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          // Auto-push end date forward if it's now too early
                          const newStart = new Date(e.target.value);
                          const currentEnd = new Date(
                            form.getValues("endDate"),
                          );
                          const minEnd = new Date(newStart);
                          minEnd.setDate(newStart.getDate() + 2);
                          if (currentEnd < minEnd) {
                            form.setValue("endDate", toInputDateString(minEnd));
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check-out Date</FormLabel>
                    <FormControl>
                      <Input type="date" min={dynamicMinEnd} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Live price breakdown */}
            {breakdown ? (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-2 text-sm">
                <p className="font-semibold text-gray-700">Price Breakdown</p>

                <div className="flex justify-between text-gray-600">
                  <span>
                    ₦{breakdown.dailyRate.toFixed(2)}/night &times;{" "}
                    {breakdown.days} night{breakdown.days !== 1 ? "s" : ""}
                  </span>
                  <span>₦{breakdown.subtotal.toFixed(2)}</span>
                </div>

                {breakdown.discountPct > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>
                      {breakdown.days >= 30 ? "Monthly" : "Weekly"} discount (
                      {breakdown.discountPct}%)
                    </span>
                    <span>−₦{breakdown.discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2">
                  <span>Estimated Total</span>
                  <span>₦{breakdown.total.toFixed(2)}</span>
                </div>

                {breakdown.discountPct > 0 && (
                  <p className="text-xs text-green-600">
                    🎉 You&apos;re saving with a{" "}
                    {breakdown.days >= 30 ? "monthly" : "weekly"} discount!
                  </p>
                )}

                <p className="text-xs text-gray-400">
                  * Payment is collected after the manager sends and you sign
                  the agreement.
                </p>
              </div>
            ) : (
              property?.pricePerMonth && (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3 text-sm text-gray-400 text-center">
                  Select valid check-in and check-out dates to see pricing
                </div>
              )
            )}

            {/* Optional message */}
            <CustomFormField
              name="message"
              label="Message (Optional)"
              type="textarea"
              placeholder="Enter any additional information"
            />

            <Button type="submit" className="bg-primary-700 text-white w-full">
              Submit Application
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationModal;
