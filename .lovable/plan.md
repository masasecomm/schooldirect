## Add AdSense unit between "School details" and "Learner enrolment"

Place the 300×600 display ad inside `src/pages/SchoolDetail.tsx`, between the "School details" Card (ends line 2399) and the `<div>` wrapping `LearnerEnrolmentCard` (line 2401).

The AdSense loader script is already included once globally in `index.html`, so we don't add it again. We only render the `<ins class="adsbygoogle">` element and run `(adsbygoogle = window.adsbygoogle || []).push({})` on mount.

### Changes

**1. `src/pages/SchoolDetail.tsx`**

Add a small inline component near the other internal components in the file:

```tsx
const AdSenseSkyscraper = () => {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, []);
  return (
    <div className="flex justify-center my-2">
      <ins
        className="adsbygoogle"
        style={{ display: "inline-block", width: 300, height: 600 }}
        data-ad-client="ca-pub-3860151941190347"
        data-ad-slot="3081508385"
      />
    </div>
  );
};
```

Then insert `<AdSenseSkyscraper />` between the closing `</Card>` of "School details" (line 2399) and the `<div className="flex flex-col gap-6">` block that contains `LearnerEnrolmentCard` (line 2401).

`useEffect` is already imported in the file (used elsewhere). No other imports required.

### Notes

- The loader `<script async src="…adsbygoogle.js?client=ca-pub-3860151941190347">` already exists in `index.html`, so we do not duplicate it.
- 300×600 is a fixed-size unit; on a 384px viewport it still fits with horizontal centering. If you'd prefer a responsive unit later, switch `style` to `display:block` and add `data-ad-format="auto"` + `data-full-width-responsive="true"`.
- TypeScript doesn't know about `window.adsbygoogle`; we suppress with a single `@ts-ignore` comment, matching common AdSense usage.