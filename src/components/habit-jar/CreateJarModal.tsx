"use client";

import { FormModal } from "@/components/ui/FormModal";
import { CreateJarForm } from "@/components/habit-jar/CreateJarForm";
import type { Category, Habit } from "@/lib/types";

interface CreateJarModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: Category[];
  habit?: Habit;
}

export function CreateJarModal({
  open,
  onClose,
  onSuccess,
  categories,
  habit,
}: CreateJarModalProps) {
  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={habit ? "Edit jar" : "Create New Jar"}
    >
      <div className="habit-jar-page -mx-5 -mb-5 md:-mx-6 md:-mb-6 px-5 pb-5 md:px-6 md:pb-6">
        <CreateJarForm
          habit={habit}
          categories={categories}
          onSuccess={onSuccess}
          onCancel={onClose}
        />
      </div>
    </FormModal>
  );
}
