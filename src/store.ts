import { create } from 'zustand';
import { Workload, WorkloadMemoryBreakdown } from './types';
import { estimateAll } from './lib/estimation';
import { validateWorkload, hasErrors } from './lib/validation';

interface FormState {
  type: string;
  modelSize: number | undefined;
  batchSize: number | undefined;
  numGPUs: number | undefined;
  precision: string;
}

interface AppState {
  workloads: Workload[];
  form: FormState;
  breakdowns: WorkloadMemoryBreakdown[];
  totalRAM: number;
  errors: Record<string, { field: string; message: string }>;
  actions: {
    addWorkload: () => void;
    removeWorkload: (id: string) => void;
    updateForm: (field: keyof FormState, value: string | number) => void;
    resetForm: () => void;
    recalculate: () => void;
    clearAll: () => void;
    setErrors: (errors: Record<string, { field: string; message: string }>) => void;
  };
}

const defaultForm: FormState = {
  type: '',
  modelSize: 7,
  batchSize: 4,
  numGPUs: 1,
  precision: 'fp16',
};

export const useAppStore = create<AppState>((set) => ({
  workloads: [],
  form: { ...defaultForm },
  breakdowns: [],
  totalRAM: 0,
  errors: {},
  actions: {
    addWorkload: () =>
      set((state) => {
        const validationErrors = validateWorkload(state.form);
        if (hasErrors(validationErrors)) {
          return { errors: validationErrors };
        }
        const newWorkload: Workload = {
          id: crypto.randomUUID(),
          type: state.form.type as any,
          modelSize: state.form.modelSize,
          batchSize: state.form.batchSize,
          numGPUs: state.form.numGPUs,
          precision: state.form.precision as any,
        };
        const updatedWorkloads = [...state.workloads, newWorkload];
        const { breakdowns, totalRAM } = estimateAll(updatedWorkloads);
        return { workloads: updatedWorkloads, breakdowns, totalRAM, errors: {} };
      }),

    removeWorkload: (id) =>
      set((state) => {
        const updatedWorkloads = state.workloads.filter((w) => w.id !== id);
        const { breakdowns, totalRAM } = estimateAll(updatedWorkloads);
        return { workloads: updatedWorkloads, breakdowns, totalRAM, errors: {} };
      }),

    updateForm: (field, value) =>
      set((state) => {
        const currentValue = (state.form as any)[field];
        // If value is undefined, remove the field to allow empty state
        if (value === undefined) {
          const { [field as string]: _, ...rest } = state.form as any;
          return { form: { ...rest } as any, errors: {} };
        }
        return { form: { ...state.form, [field]: value }, errors: {} };
      }),

    resetForm: () =>
      set({ form: { ...defaultForm }, errors: {} }),

    recalculate: () =>
      set((state) => {
        const { breakdowns, totalRAM } = estimateAll(state.workloads);
        return { breakdowns, totalRAM };
      }),

    clearAll: () =>
      set({ workloads: [], breakdowns: [], totalRAM: 0, errors: {} }),

    setErrors: (errors) => set({ errors }),
  },
}));