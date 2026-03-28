import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  validateCreateUserForm,
  hasErrors,
  type ValidationErrors,
} from "@/lib/validators";
import { usersApi, ApiError } from "@/apiService/api";

interface CreateUserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const EMPTY_FORM = {
  fullName: "",
  email: "",
  password: "",
};

export default function CreateUserFormDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateUserFormDialogProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setForm(EMPTY_FORM);
      setErrors({});
      setApiError(null);
    }
    onOpenChange(newOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    setApiError(null);
  };

  const handleCreate = async () => {
    setApiError(null);

    // Validate form
    const validationErrors = validateCreateUserForm(
      form.fullName,
      form.email,
      form.password,
      "User"
    );
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      await usersApi.create({
        name: form.fullName,
        email: form.email,
        password: form.password,
        role: "User",
      });

      // Reset and close dialog
      setForm(EMPTY_FORM);
      setErrors({});
      handleOpenChange(false);

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setApiError(error.message);
      } else {
        setApiError("Failed to create user. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
        </DialogHeader>

        {apiError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {apiError}
          </div>
        )}

        <div className="space-y-4 py-2">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label htmlFor="fullName">Full Name</label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              value={form.fullName}
              onChange={handleInputChange}
              placeholder="John Doe"
              className={errors.fullName ? "border-red-500" : ""}
              disabled={isLoading}
            />
            {errors.fullName && (
              <p className="text-xs text-red-600">{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email">Email</label>
            <Input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleInputChange}
              placeholder="john@example.com"
              className={errors.email ? "border-red-500" : ""}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-xs text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="password">Password</label>
            <Input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleInputChange}
              placeholder="••••••"
              className={errors.password ? "border-red-500" : ""}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-xs text-red-600">{errors.password}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

