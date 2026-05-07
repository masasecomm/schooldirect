import { useMemo, useState } from "react";
import { ratingForSchool, reviewCountForSchool } from "@/lib/school-rating";
import { Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";

export { ratingForSchool, reviewCountForSchool };

type Props = {
  schoolId: string;
  schoolName: string;
  className?: string;
};

export const SchoolRating = ({ schoolId, schoolName, className }: Props) => {
  const rating = useMemo(() => ratingForSchool(schoolId), [schoolId]);
  const reviews = useMemo(() => reviewCountForSchool(schoolId), [schoolId]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("parent");
  const [message, setMessage] = useState("");
  const [stars, setStars] = useState(5);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      toast({
        title: "Please complete the form",
        description: "Your name and a short message are required.",
      });
      return;
    }
    toast({
      title: "Thanks for your review",
      description: `Your ${stars}-star review of ${schoolName} has been submitted.`,
    });
    setName("");
    setMessage("");
    setStars(5);
    setRole("parent");
    setOpen(false);
  };

  // Render 5 stars, partial fill via overlay width.
  const fullPct = (rating / 5) * 100;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`group inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-primary-foreground backdrop-blur transition hover:bg-white/20 ${className ?? ""}`}
        aria-label={`Rated ${rating} out of 5 stars by ${reviews} reviewers. Click to leave a review.`}
        title="Leave a review"
        itemScope
        itemType="https://schema.org/AggregateRating"
      >
        <span className="relative inline-flex">
          {/* Background grey stars */}
          <span className="inline-flex">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star
                key={`bg-${i}`}
                className="h-4 w-4 text-white/30"
                fill="currentColor"
                strokeWidth={0}
              />
            ))}
          </span>
          {/* Foreground gold stars clipped to rating */}
          <span
            className="pointer-events-none absolute inset-0 inline-flex overflow-hidden"
            style={{ width: `${fullPct}%` }}
            aria-hidden="true"
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <Star
                key={`fg-${i}`}
                className="h-4 w-4 shrink-0 text-amber-400"
                fill="currentColor"
                strokeWidth={0}
              />
            ))}
          </span>
        </span>
        <span>
          <span itemProp="ratingValue">{rating.toFixed(1)}</span>
          <span className="text-primary-foreground/70">
            {" "}
            (<span itemProp="reviewCount">{reviews}</span>)
          </span>
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review {schoolName}</DialogTitle>
            <DialogDescription>
              Share your experience to help other parents make a better decision.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Your rating</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setStars(n)}
                    aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
                    className="rounded p-0.5 transition hover:scale-110"
                  >
                    <Star
                      className={`h-7 w-7 ${
                        n <= stars ? "text-amber-400" : "text-muted-foreground/40"
                      }`}
                      fill="currentColor"
                      strokeWidth={0}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="review-name">Your name</Label>
              <Input
                id="review-name"
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 80))}
                placeholder="Jane M."
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>I am a</Label>
              <RadioGroup
                value={role}
                onValueChange={setRole}
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="role-parent" value="parent" />
                  <Label htmlFor="role-parent" className="font-normal">Parent</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="role-student" value="student" />
                  <Label htmlFor="role-student" className="font-normal">Student</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="role-other" value="other" />
                  <Label htmlFor="role-other" className="font-normal">Other</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="review-message">Your review</Label>
              <Textarea
                id="review-message"
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
                placeholder="What stood out about this school?"
                rows={4}
                required
              />
              <div className="text-right text-xs text-muted-foreground">
                {message.length}/1000
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit review</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};