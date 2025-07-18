import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Clock, Settings, Save, AlertTriangle } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertNudgeSettingsSchema } from "@shared/schema";
import type { NudgeSettings } from "@/lib/types";
import { z } from "zod";

type FormData = z.infer<typeof insertNudgeSettingsSchema>;

export default function NudgeSettingsPage() {
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery<NudgeSettings>({
    queryKey: ["/api/nudge-settings"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(insertNudgeSettingsSchema),
    defaultValues: {
      firstReminderDays: 7,
      secondReminderDays: 14,
      finalNoticeDays: 21,
      autoNudgeEnabled: true,
      businessHoursOnly: true,
      weekdaysOnly: true,
    },
  });

  // Update form when settings are loaded
  if (settings && !form.formState.isDirty) {
    form.reset({
      firstReminderDays: settings.firstReminderDays ?? 7,
      secondReminderDays: settings.secondReminderDays ?? 14,
      finalNoticeDays: settings.finalNoticeDays ?? 21,
      autoNudgeEnabled: settings.autoNudgeEnabled ?? true,
      businessHoursOnly: settings.businessHoursOnly ?? true,
      weekdaysOnly: settings.weekdaysOnly ?? true,
    });
  }

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("PUT", "/api/nudge-settings", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings updated successfully",
        description: "Your nudge automation settings have been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/nudge-settings"] });
    },
    onError: () => {
      toast({
        title: "Failed to update settings",
        description: "There was an error saving your settings.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    updateSettingsMutation.mutate(data);
  };

  const resetToDefaults = () => {
    form.reset({
      firstReminderDays: 7,
      secondReminderDays: 14,
      finalNoticeDays: 21,
      autoNudgeEnabled: true,
      businessHoursOnly: true,
      weekdaysOnly: true,
    });
  };

  if (isLoading) {
    return (
      <>
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="py-4">
              <h1 className="text-2xl font-bold text-gray-900">Nudge Settings</h1>
              <p className="text-sm text-gray-500">Configure automated payment reminders</p>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-gray-900">Nudge Settings</h1>
            <p className="text-sm text-gray-500">Configure automated payment reminders and scheduling</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto space-y-8">
          
          {/* Timing Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-flow-blue bg-opacity-10 rounded-lg flex items-center justify-center">
                  <Clock className="text-flow-blue w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Nudge Timing</h2>
                  <p className="text-sm text-gray-500">Set when automated reminders are sent</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="firstReminderDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Reminder</FormLabel>
                          <div className="flex items-center space-x-3">
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1" 
                                max="30" 
                                className="w-20"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <span className="text-sm text-gray-500">days after due date</span>
                          </div>
                          <FormDescription>
                            Send the first gentle reminder to customers
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="secondReminderDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Second Reminder</FormLabel>
                          <div className="flex items-center space-x-3">
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1" 
                                max="60" 
                                className="w-20"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <span className="text-sm text-gray-500">days after due date</span>
                          </div>
                          <FormDescription>
                            Send a more urgent reminder for past due invoices
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="finalNoticeDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Final Notice</FormLabel>
                          <div className="flex items-center space-x-3">
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1" 
                                max="90" 
                                className="w-20"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <span className="text-sm text-gray-500">days after due date</span>
                          </div>
                          <FormDescription>
                            Send the final notice before escalation
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  {/* Automation Settings */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-flow-warning bg-opacity-10 rounded-lg flex items-center justify-center">
                        <Settings className="text-flow-warning w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Automation Settings</h3>
                        <p className="text-sm text-gray-500">Control when and how nudges are sent</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="autoNudgeEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable Auto-Nudging</FormLabel>
                              <FormDescription>
                                Automatically send payment reminders based on the schedule above
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="businessHoursOnly"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Business Hours Only</FormLabel>
                              <FormDescription>
                                Send nudges only during business hours (9 AM - 5 PM)
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="weekdaysOnly"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Weekdays Only</FormLabel>
                              <FormDescription>
                                Send nudges only on weekdays (Monday through Friday)
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Warning Notice */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="text-yellow-600 w-5 h-5 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">Important Notice</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Changes to these settings will affect all future automated nudges. 
                          Existing scheduled nudges will continue with their original timing.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetToDefaults}
                    >
                      Reset to Defaults
                    </Button>
                    
                    <Button
                      type="submit"
                      disabled={updateSettingsMutation.isPending || !form.formState.isDirty}
                      className="bg-flow-blue text-white hover:bg-blue-600"
                    >
                      <Save className="mr-2 w-4 h-4" />
                      {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Current Settings Preview */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Current Schedule Preview</h3>
              <p className="text-sm text-gray-500">How your nudge timeline will work</p>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-flow-blue bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-flow-blue text-sm font-semibold">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">First Reminder</p>
                    <p className="text-sm text-gray-500">
                      Sent {form.watch("firstReminderDays")} days after invoice due date
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-flow-warning bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-flow-warning text-sm font-semibold">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Second Reminder</p>
                    <p className="text-sm text-gray-500">
                      Sent {form.watch("secondReminderDays")} days after invoice due date
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-flow-danger bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-flow-danger text-sm font-semibold">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Final Notice</p>
                    <p className="text-sm text-gray-500">
                      Sent {form.watch("finalNoticeDays")} days after invoice due date
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
