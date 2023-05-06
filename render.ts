import { FieldType, FormField } from "@opengovsg/formsg-sdk/dist/types";

const renderers: Partial<Record<FieldType, (formField: FormField) => string>> =
  {
    section: renderHeader,
    textarea: renderListItemLargeText,
    table: renderListItemLargeText,
  };

function renderHeader(formField: FormField): string {
  return `\n*${formField.question}*`;
}

function renderListItemSmallText(formField: FormField): string {
  return `- ${formField.question}: \`${formField.answer}\``;
}

function renderListItemLargeText(formField: FormField): string {
  return `- ${formField.question}: \t\`\`\`${
    formField.answer || formField.answerArray
  }\`\`\``;
}

export function renderFormField(formField: FormField): string {
  if (renderers[formField.fieldType]) {
    return renderers[formField.fieldType]!!(formField);
  }

  return renderListItemSmallText(formField);
}
