Form controls share the chunky, glossy Yaycay look. Always pair inputs with a `label`.

```jsx
import { Input } from "./Input";
import { Select } from "./Select";
import { Checkbox } from "./Checkbox";
import { Switch } from "./Switch";

<Input label="Trip name" placeholder="Summer in Sicily" hint="You can rename this later" icon={<MapPin/>} />
<Select label="Travellers" options={["Just us two", "Family of 4", "Big group"]} placeholder="Choose…" />
<Checkbox label="Add the kids' packing list" defaultChecked />
<Checkbox radio name="pace" label="Relaxed" />
<Switch label="Daily countdown email" defaultChecked />
```

Inputs: `label`, `hint`, `error` (coral state), `icon`. Select: `options` (strings or `{value,label}`) or
`<option>` children, plus `placeholder`. Checkbox: set `radio` for a radio. Switch is green when on.
Sentence-case labels; error copy is friendly ("Pop in a trip name to continue").
