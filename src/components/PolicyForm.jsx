import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Shield, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { 
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PolicyService } from '../services/PolicyService';

const formSchema = z.object({
  name: z.string().min(3, "Policy name must be at least 3 characters"),
  company: z.string().min(2, "Company name must be at least 2 characters"),
  value: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Value must be a positive number",
  }),
  premium: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Premium must be a positive number",
  }),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  nominees: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0 && Number(val) <= 5, {
    message: "Nominees must be between 1 and 5",
  }),
});

const PolicyForm = ({ onClose, onAddPolicy }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      company: "",
      value: "",
      premium: "",
      startDate: "",
      endDate: "",
      nominees: "1",
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      // Format dates correctly for MongoDB
      const startDate = new Date(data.startDate).toISOString();
      const endDate = new Date(data.endDate).toISOString();
      
      // Create new policy object - MongoDB will generate _id
      const newPolicy = {
        name: data.name,
        company: data.company,
        value: Number(data.value),
        premium: Number(data.premium),
        startDate: startDate,
        endDate: endDate,
        status: 'Active',
      };
      
      console.log('Submitting policy to backend:', newPolicy);
      
      // Add policy via API
      const savedPolicy = await PolicyService.addPolicy(newPolicy);
      
      // Add policy via callback for state update
      onAddPolicy(savedPolicy);
      toast.success(`Policy added successfully`);
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to add policy. Please try again.');
      console.error('Policy add error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto border-0 shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-full bg-insurance-50">
            <Shield className="h-6 w-6 text-insurance-600" />
          </div>
          <h2 className="text-xl font-bold">Add New Policy</h2>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Policy Name</FormLabel>
                  <FormControl>
                    <Input className="border-input focus:ring-0" placeholder="Term Life Insurance" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Insurance Company</FormLabel>
                  <FormControl>
                    <Input className="border-input focus:ring-0" placeholder="Prudential Insurance" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sum Assured ($)</FormLabel>
                  <FormControl>
                    <Input className="border-input focus:ring-0" type="number" placeholder="250000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="premium"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Premium ($)</FormLabel>
                  <FormControl>
                    <Input className="border-input focus:ring-0" type="number" placeholder="45" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input className="border-input focus:ring-0" type="date" {...field} />
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
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input className="border-input focus:ring-0" type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="nominees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Nominees</FormLabel>
                  <FormControl>
                    <Input className="border-input focus:ring-0" type="number" min="1" max="5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              variant="outline" 
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-insurance-600 hover:bg-insurance-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Policy'}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
};

export default PolicyForm;
