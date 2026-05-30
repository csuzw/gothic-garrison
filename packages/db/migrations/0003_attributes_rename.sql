ALTER TABLE "officer_attributes" RENAME TO "attributes";--> statement-breakpoint
ALTER TABLE "soldier_type_fixed_attributes" RENAME COLUMN "officer_attribute_id" TO "attribute_id";--> statement-breakpoint
ALTER TABLE "attributes" ADD COLUMN "is_officer" boolean DEFAULT false NOT NULL;
