## Update footer to match the new logo

The footer in `src/components/schools/SiteFooter.tsx` still shows the old branding:

> © 2026 Gauteng Schools Directory · Public information

I'll change the left side of the footer to match the new logo wording from the header ("School Direct" / "Find a school near you"):

**New footer (left side):**
> © 2026 School Direct · Find a school near you

The right side ("Data source: Gauteng Department of Education, 2023") stays unchanged — it's an attribution, not branding. Let me know if you want that removed or updated too.

### File changed
- `src/components/schools/SiteFooter.tsx` — replace the left-side `<p>` text

### After approval
Once you approve, the change pushes to GitHub and the deploy workflow auto-uploads to schooldirect.org within ~2–3 minutes.

---

**Heads-up — free shortcut for next time:** small text changes like this can be done without using AI credits via **Visual Edits** (the Edit button at the bottom-left of the chat box). Click the footer text → type the new text → Save. No prompt needed.

<lov-actions>
<lov-link url="https://docs.lovable.dev/features/visual-edit">Read more about Visual Edits</lov-link>
</lov-actions>
