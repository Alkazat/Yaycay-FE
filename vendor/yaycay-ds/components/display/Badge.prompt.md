Small display atoms: status pills, filter chips, and avatars.

```jsx
import { Badge } from "./Badge";
import { Tag } from "./Tag";
import { Avatar, AvatarGroup } from "./Avatar";

<Badge tone="meadow" dot>Planned</Badge>
<Badge tone="coral">3 sleeps to go</Badge>
<Tag icon={<Beach/>} active onClick={...}>Beaches</Tag>
<Tag onRemove={...}>Sicily</Tag>
<AvatarGroup>
  <Avatar name="Mia Ross" tone="sun" />
  <Avatar name="Theo Ross" tone="aqua" />
</AvatarGroup>
```

Badge tones: `sky · sun · aqua · meadow · coral · ink · soft`; add `dot` for a status dot.
Tag: outlined by default, `active` fills it; `onRemove` adds a ×; `onClick` makes it springy.
Avatar: `name` → initials, or pass `src`; `tone`, `size`, `ring`. Wrap several in `AvatarGroup` to overlap.
