import { mysqlTable, text, timestamp, int, json, boolean } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// Forms table - stores form definitions created by admin
export const forms = mysqlTable('forms', {
  id: int('id').primaryKey().autoincrement(),
  title: text('title').notNull(),
  description: text('description'),
  fields: json('fields').notNull(), // JSON array of field definitions
  submitButtonText: text('submit_button_text').default('Submit'),
  heroImageUrl: text('hero_image_url'), // URL for hero banner image
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Form responses table - stores user submissions
export const formResponses = mysqlTable('form_responses', {
  id: int('id').primaryKey().autoincrement(),
  formId: int('form_id').notNull().references(() => forms.id),
  phoneNumber: text('phone_number').notNull(), // Required field for all forms
  responseData: json('response_data').notNull(), // JSON object with field_name: value pairs
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
  heroImageUrl?: string;
}