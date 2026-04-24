import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Send, Phone, MessageSquare, FileSpreadsheet } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  CONTACT_SHEET_ENDPOINT,
  hasContactSheetEndpoint,
} from "@/lib/contact-endpoint";

const RELATIONSHIPS = [
  "Mother",
  "Father",
  "Grand Parent",
  "Guardian",
] as const;

const formSchema = z.object({
  parentName: z
    .string()
    .trim()
    .min(2, "Please enter your full name")
    .max(100, "Name must be under 100 characters"),
  relationship: z.enum(RELATIONSHIPS, {
    required_error: "Please select your relationship to the learner",
  }),
  learnerName: z
    .string()
    .trim()
    .min(2, "Please enter the learner's name and surname")
    .max(100, "Name must be under 100 characters"),
  learnerAge: z
    .coerce.number({ invalid_type_error: "Age must be a number" })
    .int("Age must be a whole number")
    .min(3, "Age must be at least 3")
    .max(25, "Age must be 25 or below"),
  gradeApplied: z
    .string()
    .trim()
    .min(1, "Please enter the grade")
    .max(20, "Grade must be under 20 characters"),
  message: z
    .string()
    .trim()
    .min(5, "Please write a short message")
    .max(1000, "Message must be under 1000 characters"),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  schoolName: string;
  emisId?: string;
  schoolEmail?: string | null;
  schoolPhone?: string | null;
};

const buildMessageBody = (v: FormValues, schoolName: string) =>
  [
    `Hello ${schoolName},`,
    "",
    `I would like to enquire about admission for my learner.`,
    "",
    `Parent / Guardian: ${v.parentName}`,
    `Relationship to learner: ${v.relationship}`,
    `Learner: ${v.learnerName}`,
    `Learner age: ${v.learnerAge}`,
    `Grade applied for: ${v.gradeApplied}`,
    "",
    `Message:`,
    v.message,
    "",
    `Kind regards,`,
    v.parentName,
  ].join("\n");

export const ContactSchoolCard = ({
  schoolName,
  emisId,
  schoolEmail,
  schoolPhone,
}: Props) => {
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      parentName: "",
      relationship: undefined as unknown as FormValues["relationship"],
      learnerName: "",
      learnerAge: undefined as unknown as number,
      gradeApplied: "",
      message: "",
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const relationship = watch("relationship");

  const postToSheet = async (v: FormValues) => {
    if (!hasContactSheetEndpoint()) {
      toast({
        title: "Submission endpoint not configured",
        description:
          "The Google Sheet endpoint is missing. Please add the Apps Script URL in src/lib/contact-endpoint.ts.",
        variant: "destructive",
      });
      return false;
    }
    try {
      // Apps Script web apps redirect; use no-cors so the browser does not block the response read.
      // Apps Script still receives and processes the POST.
      await fetch(CONTACT_SHEET_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          schoolName,
          emisId: emisId ?? "",
          parentName: v.parentName,
          relationship: v.relationship,
          learnerName: v.learnerName,
          learnerAge: v.learnerAge,
          gradeApplied: v.gradeApplied,
          message: v.message,
          pageUrl: typeof window !== "undefined" ? window.location.href : "",
        }),
      });
      return true;
    } catch (err) {
      console.error("Sheet submission failed", err);
      toast({
        title: "Could not record your enquiry",
        description: "We will still try to open your chosen channel below.",
        variant: "destructive",
      });
      return false;
    }
  };

  const submitToSheet = async (v: FormValues) => {
    setSubmitting(true);
    try {
      const ok = await postToSheet(v);
      if (ok) {
        toast({
          title: "✓ Enquiry submitted successfully",
          description: `Your enquiry for ${schoolName} has been recorded. The school will be in touch.`,
        });
        form.reset();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const sendVia = (channel: "email" | "whatsapp") => async (v: FormValues) => {
    setSubmitting(true);
    try {
      // Always record the enquiry to the sheet, then hand off to the chosen channel.
      let sheetOk = false;
      if (hasContactSheetEndpoint()) {
        sheetOk = await postToSheet(v);
      }
      const subject = `Admission enquiry — ${v.learnerName} (Grade ${v.gradeApplied})`;
      const body = buildMessageBody(v, schoolName);

      if (channel === "email") {
        if (!schoolEmail) {
          toast({
            title: "No email on file",
            description:
              "This school does not have an email address listed. Try WhatsApp or call instead.",
            variant: "destructive",
          });
          return;
        }
        const href = `mailto:${encodeURIComponent(schoolEmail)}?subject=${encodeURIComponent(
          subject,
        )}&body=${encodeURIComponent(body)}`;
        window.location.href = href;
        toast({
          title: "Opening your email app",
          description: `Your message to ${schoolName} is ready to send.`,
        });
        if (sheetOk) form.reset();
      } else {
        if (!schoolPhone) {
          toast({
            title: "No phone on file",
            description:
              "This school does not have a phone number listed. Try email instead.",
            variant: "destructive",
          });
          return;
        }
        const digits = schoolPhone.replace(/\D/g, "");
        // South African numbers: convert leading 0 to country code 27.
        const waNumber = digits.startsWith("0") ? `27${digits.slice(1)}` : digits;
        const href = `https://wa.me/${waNumber}?text=${encodeURIComponent(
          `*${subject}*\n\n${body}`,
        )}`;
        window.open(href, "_blank", "noopener,noreferrer");
        toast({
          title: "Opening WhatsApp",
          description: `Your message to ${schoolName} is ready to send.`,
        });
        if (sheetOk) form.reset();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const fieldError = (msg?: string) =>
    msg ? <p className="mt-1 text-xs font-medium text-destructive">{msg}</p> : null;

  return (
    <Card className="overflow-hidden shadow-[var(--shadow-card)]">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5" />
              Get in touch
            </div>
            <h2 className="mt-1 text-lg font-semibold">Contact {schoolName}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Send an admission enquiry directly to the school via email or WhatsApp.
            </p>
          </div>
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
            <Mail className="h-5 w-5" />
          </div>
        </div>

        <form className="mt-6 space-y-4" noValidate>
          <div>
            <Label htmlFor="parentName">Parent / Guardian name</Label>
            <Input
              id="parentName"
              autoComplete="name"
              placeholder="e.g. Thandi Dlamini"
              {...register("parentName")}
              className="mt-1.5"
            />
            {fieldError(errors.parentName?.message)}
          </div>

          <div>
            <Label htmlFor="relationship">Relationship to learner</Label>
            <Select
              value={relationship ?? ""}
              onValueChange={(val) =>
                setValue("relationship", val as FormValues["relationship"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger id="relationship" className="mt-1.5">
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                {RELATIONSHIPS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldError(errors.relationship?.message)}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="learnerName">Learner name & surname</Label>
              <Input
                id="learnerName"
                placeholder="e.g. Sipho Dlamini"
                {...register("learnerName")}
                className="mt-1.5"
              />
              {fieldError(errors.learnerName?.message)}
            </div>
            <div>
              <Label htmlFor="learnerAge">Learner age</Label>
              <Input
                id="learnerAge"
                type="number"
                inputMode="numeric"
                min={3}
                max={25}
                placeholder="e.g. 6"
                {...register("learnerAge")}
                className="mt-1.5"
              />
              {fieldError(errors.learnerAge?.message)}
            </div>
          </div>

          <div>
            <Label htmlFor="gradeApplied">Grade applied for</Label>
            <Input
              id="gradeApplied"
              placeholder="e.g. Grade R, Grade 1, Grade 8"
              {...register("gradeApplied")}
              className="mt-1.5"
            />
            {fieldError(errors.gradeApplied?.message)}
          </div>

          <div>
            <Label htmlFor="message">Short message</Label>
            <Textarea
              id="message"
              rows={4}
              placeholder="Tell the school anything else they should know about your enquiry."
              {...register("message")}
              className="mt-1.5"
            />
            {fieldError(errors.message?.message)}
          </div>

          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              disabled={submitting}
              onClick={handleSubmit(submitToSheet)}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Submit enquiry
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={submitting}
              onClick={handleSubmit(sendVia("email"))}
            >
              <Send className="h-4 w-4" />
              Send via Email
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={submitting}
              onClick={handleSubmit(sendVia("whatsapp"))}
            >
              <Phone className="h-4 w-4" />
              Send via WhatsApp
            </Button>
          </div>

          {(!schoolEmail || !schoolPhone) && (
            <p className="text-[11px] text-muted-foreground">
              {!schoolEmail && "No email is listed for this school. "}
              {!schoolPhone && "No phone is listed for this school. "}
              Available channels are limited above.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default ContactSchoolCard;