import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, TrendingUp, Settings, ChevronRight, Droplets, Zap, Flame } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertConsumptionReadingSchema } from "@shared/schema";
import { z } from "zod";
import { useState } from "react";

const getFormSchema = (t: any) => z.object({
  electricity: z.string().min(0, t("electricityRequired")).default("0"),
  water: z.string().min(0, t("waterRequired")).default("0"),
  gas: z.string().min(0, t("gasRequired")).default("0"),
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2030),
  readingDate: z.string().min(1, t("dateRequired")),
  isAdvancedMode: z.boolean().default(false),
  weekNumber: z.number().min(1).max(4).optional(),
});

export function QuickActions() {
  const { t } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddReadingOpen, setIsAddReadingOpen] = useState(false);

  const consumptionFormSchema = getFormSchema(t);
  type ConsumptionFormData = z.infer<typeof consumptionFormSchema>;

  const currentDate = new Date();
  const form = useForm<ConsumptionFormData>({
    resolver: zodResolver(consumptionFormSchema),
    defaultValues: {
      electricity: "0",
      water: "0", 
      gas: "0",
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
      readingDate: currentDate.toISOString().split('T')[0],
      isAdvancedMode: false
    }
  });

  const addReadingMutation = useMutation({
    mutationFn: async (data: ConsumptionFormData) => {
      const payload = {
        electricity: data.electricity,
        water: data.water,
        gas: data.gas,
        month: data.month,
        year: data.year,
        readingDate: new Date(data.readingDate).toISOString(),
        isAdvancedMode: data.isAdvancedMode,
        weekNumber: data.weekNumber
      };
      const response = await apiRequest("POST", "/api/consumption", payload);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t("successTitle"),
        description: t("successDescription"),
      });
      form.reset();
      setIsAddReadingOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/consumption"] });
    },
    onError: (error: Error) => {
      toast({
        title: t("errorTitle"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ConsumptionFormData) => {
    addReadingMutation.mutate(data);
  };



  const actions = [
    {
      icon: <Plus className="text-primary mr-3" />,
      label: t("dashboard.addReading"),
      action: () => setIsAddReadingOpen(true),
    },
    {
      icon: <TrendingUp className="text-primary mr-3" />,
      label: t("dashboard.viewReport"),
      action: () => window.location.href = "/analytics",
    },
    {
      icon: <Settings className="text-primary mr-3" />,
      label: t("dashboard.settings"),
      action: () => window.location.href = "/profile",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.quickActions")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-between p-3 h-auto bg-primary-light dark:bg-gray-700 hover:bg-green-100 dark:hover:bg-gray-600"
              onClick={action.action}
            >
              <div className="flex items-center">
                {action.icon}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {action.label}
                </span>
              </div>
              <ChevronRight className="text-gray-400 h-4 w-4" />
            </Button>
          ))}
        </div>

        {/* Add Reading Dialog */}
        <Dialog open={isAddReadingOpen} onOpenChange={setIsAddReadingOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t("dashboard.addReading")}</DialogTitle>
              <DialogDescription>
                {t("addReadingDescription")}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Month and Year Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="month"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("selectMonth")}</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("selectMonth")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                              <SelectItem key={month} value={month.toString()}>
                                {new Date(2025, month - 1).toLocaleString('en', { month: 'long' })}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("selectYear")}</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("selectYear")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({length: 11}, (_, i) => 2020 + i).map(year => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Resource consumption inputs */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="electricity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-yellow-500" />
                            {t("dashboard.electricity")} (kWh)
                          </div>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="0" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="water"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <div className="flex items-center gap-2">
                            <Droplets className="h-4 w-4 text-blue-500" />
                            {t("dashboard.water")} (m³)
                          </div>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="0" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <div className="flex items-center gap-2">
                            <Flame className="h-4 w-4 text-orange-500" />
                            {t("dashboard.gas")} (m³)
                          </div>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="0" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Helpful tips */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-2">
                    {t("dataSourcesTitle")}
                  </p>
                  <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                    {t("dataSourcesDescription").split('\n').map((line, index) => (
                      <div key={index}>{line}</div>
                    ))}
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="readingDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("readingDate")}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddReadingOpen(false)}
                    disabled={addReadingMutation.isPending}
                  >
                    {t("cancel")}
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={addReadingMutation.isPending}
                  >
                    {addReadingMutation.isPending ? "Saving..." : t("save")}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
