Surfaces hold content: the outlined `Card` family, big `Stat` figures, and the `ProgressMeter`.

```jsx
import { Card, CardMedia, CardBody, CardFooter } from "./Card";
import { Stat } from "./Stat";
import { ProgressMeter } from "./ProgressMeter";

<Card interactive>
  <CardMedia src={photo} height={170} tag={<Badge tone="sun">Beach</Badge>} />
  <CardBody title="Sicily with the kids" subtitle="7 days · Jul 12–19" />
  <CardFooter>
    <ProgressMeter value={3} max={7} valueText="Day 3 of 7" label="Planned" />
  </CardFooter>
</Card>

<Stat icon={<Plane/>} value="12" label="sleeps to go" tone="sun" />
```

Card variants: `default` (royal outline), `flat`, `soft`. Add `interactive` for hover-lift.
ProgressMeter tones: `sky · sun · meadow · aqua`; pass `valueText` for "Day 3 of 7" style copy.
Stat takes any `value` node — keep figures Fredoka and bold.
