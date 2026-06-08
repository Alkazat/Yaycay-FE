Inline message banner / toast for feedback. Warm tones, friendly copy.

```jsx
import { Banner } from "./Banner";

<Banner tone="success" title="Saved!" onClose={...}>Your day plan is looking great.</Banner>
<Banner tone="warning" title="2 sleeps to go">Time to start that packing list.</Banner>
<Banner tone="danger" title="That didn't save">Give it another go in a moment.</Banner>
```

Tones: `success` (meadow) · `warning` (sun) · `info` (sky) · `danger` (coral). Auto-icon per tone.
Pass `onClose` to show a dismiss ×. Keep copy short, warm and lowercase-friendly.
