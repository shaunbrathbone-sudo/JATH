type ProductData = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    categoryName: string;
    categorySlug: string;
};

type StepOption = {
    id: string;
    label: string;
    value: string;
    description: string | null;
};

type WorkflowStepData = {
    id: string;
    label: string;
    fieldType: string;
    fieldKey: string;
    helpText: string | null;
    unit: string | null;
    validationRules: string | null;
    sortOrder: number;
    isRequired: boolean;
    showIf: string | null;
    options: StepOption[];
};

type WorkflowData = {
    id: string;
    steps: WorkflowStepData[];
};

export type { ProductData, StepOption, WorkflowStepData, WorkflowData };
