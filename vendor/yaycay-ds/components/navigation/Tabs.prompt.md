Segmented pill tabs — the active tab fills sky with a pop shadow.

```jsx
import { Tabs } from "./Tabs";

const [tab, setTab] = React.useState("plan");
<Tabs
  value={tab}
  onChange={setTab}
  tabs={[
    { value: "plan", label: "Day plan", icon: <Calendar/> },
    { value: "pack", label: "Packing", count: 8 },
    { value: "budget", label: "Budget" },
  ]}
/>
```

Pass `tabs` as strings or `{value,label,icon,count}`. Controlled — track `value` yourself.
Keep labels short and in sentence case.
