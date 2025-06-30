import { pgTable, text, timestamp, integer, serial, jsonb, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Forms table - stores form definitions created by admin
export const forms = pgTable('forms', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  fields: jsonb('fields').notNull(), // JSON array of field definitions
  submitButtonText: text('submit_button_text').default('Submit'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Form responses table - stores user submissions
export const formResponses = pgTable('form_responses', {
  id: serial('id').primaryKey(),
  formId: integer('form_id').notNull().references(() => forms.id),
  phoneNumber: text('phone_number').notNull(), // Required field for all forms
  responseData: jsonb('response_data').notNull(), // JSON object with field_name: value pairs
  submittedAt: timestamp('submitted_at').defaultNow(),
});

// Relations
export const formsRelations = relations(forms, ({ many }) => ({
  responses: many(formResponses),
}));

export const formResponsesRelations = relations(formResponses, ({ one }) => ({
  form: one(forms, {
    fields: [formResponses.formId],
    references: [forms.id],
  }),
}));

// Types
export type Form = typeof forms.$inferSelect;
export type InsertForm = typeof forms.$inferInsert;
export type FormResponse = typeof formResponses.$inferSelect;
export type InsertFormResponse = typeof formResponses.$inferInsert;

// Field types for form builder
export type FieldType = 
  | 'text' 
  | 'textarea' 
  | 'password' 
  | 'email' 
  | 'number' 
  | 'date' 
  | 'time' 
  | 'checkbox' 
  | 'radio' 
  | 'select' 
  | 'file';

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For radio, select, checkbox
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface FormDefinition {
  title: string;
  description?: string;
  fields: FormField[];
}