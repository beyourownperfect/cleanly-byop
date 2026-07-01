# Home OS — Design Reset

---

## 1. Design Philosophy

Home OS is not an app you manage. It is an app you *feel*.

Every pixel should answer one question: **"What is the next obvious thing I can restore?"**

The app should create the same emotional satisfaction as:
- Snapping a lid onto a storage box
- Hanging a freshly washed shirt
- Placing a book back on a shelf
- Arranging a perfectly clean desk

Those tiny moments of closure ARE the product.

---

## 2. Three Design Directions

### Direction A: Calm / Muji

**Vibe:** A quiet room. Morning light. Wood and linen.

| Element | Treatment |
|---|---|
| Colors | Warm beige (#F5F0EB), clay (#C4A882), warm white (#FAF8F5) |
| Typography | Inter Light, generous leading, low contrast |
| Buttons | Subtle, pill-shaped, clay-toned |
| Motion | Slow, deliberate, easing like a door closing |
| Shadows | Barely perceptible, warm-toned |
| Sound | Soft paper rustle, wood click |
| Emotion | Peaceful, grounded, meditative |

**Reference:** Muji packaging, Japanese tea rooms, slow living aesthetics.

**Best for:** Users who want their tools to disappear entirely.

---

### Direction B: Nintendo / Delight

**Vibe:** A joyful game. Bright mornings. Playful satisfaction.

| Element | Treatment |
|---|---|
| Colors | Coral pink (#FF8FAB), soft mint (#7ED4AD), warm cream (#FFF8F0) |
| Typography | Inter Medium, playful sizing, high contrast on CTAs |
| Buttons | Large, rounded, bouncy, candy-colored |
| Motion | Spring physics, slight overshoot, satisfying settle |
| Shadows | Colored, playful, slightly floating |
| Sound | Ceramic tap, wooden block click, gentle chime |
| Emotion | Delightful, satisfying, makes you smile |

**Reference:** Nintendo UI, Duolingo streaks, Animal Crossing dialogs.

**Best for:** Users who want the interaction itself to feel rewarding.

---

### Direction C: Apple Living / Premium

**Vibe:** A curated home. Soft light. Premium materials.

| Element | Treatment |
|---|---|
| Colors | Sage (#B5C9B7), soft gold (#D4B895), frosted white (#F2F2F0) |
| Typography | Inter, precise leading, elegant hierarchy |
| Buttons | Glassmorphic, frosted, precise shadows |
| Motion | Fluid, Apple-like, priority on polish |
| Shadows | Precise, cool, layered depth |
| Sound | Hushed, premium, leather-soft |
| Emotion | Calm, sophisticated, expensive |

**Reference:** Apple Home, Apple Journal, fine product packaging.

**Best for:** Users who want a premium, curated experience.

---

### My Recommendation: Direction C as Foundation, B for Moments

**Direction C (Apple Living)** should be the baseline visual language — the interface feels like a well-designed room. Calm, premium, intentional.

**Direction B (Nintendo)** should inform the interaction patterns — bouncy spring animations, satisfying button presses, joyful micro-moments when you complete an action.

**Direction A (Muji)** should inform the overall restraint — nothing unnecessary, every element has purpose, silence is part of the design.

This blend creates: **a premium, joyful, restrained experience.**

---

## 3. Component Language

Every component must pass three tests:

1. **Can I tap it with one thumb?** → Yes, if it's within reach
2. **Do I know what it does without reading?** → Yes, if the visual language is consistent
3. **Does tapping it feel good?** → Yes, if motion and sound are designed

| Component | Shape | Touch Size | Motion |
|---|---|---|---|
| Primary CTA | Full-width pill | 72px height | Spring scale 0.97 on press |
| Secondary CTA | Pill outline | 56px height | Spring scale 0.95 on press |
| Icon Button | Circle | 56px diameter | Gentle lift on press |
| Object Card | Large rounded card | Full width, 200-280px | Slides, compresses, dissolves |
| Object Emoji | Circle, centered | 140px diameter | Pulse, settle, glow |
| Sheet Handle | Short pill | 60px wide, 6px tall | Static |
| Progress Chip | Small pill | 32px height | Fade in/out |
| FAB | Circle, bottom-right | 60px diameter | Spring scale + rotation |

---

## 4. Motion Language

Every animation uses spring physics. No linear transitions.

| Interaction | Spring Config | Duration | Sound |
|---|---|---|---|
| Object appears | damping 20, stiffness 180 | ~350ms | — |
| Object compresses (tap) | damping 15, stiffness 300 | ~100ms | — |
| Object completes | damping 25, stiffness 200 | ~500ms | Wooden click |
| Next object rises | damping 22, stiffness 160 | ~450ms | — |
| Sheet opens | damping 28, stiffness 250 | ~400ms | Paper whoosh |
| Sheet closes | damping 30, stiffness 300 | ~300ms | Soft thud |
| Navigation push | damping 24, stiffness 200 | ~350ms | — |
| Tab switch | opacity crossfade | ~200ms | — |
| Atmosphere shift | CSS transition | 800ms | — |
| Button press | damping 15, stiffness 400 | ~80ms | Ceramic tap |
| Peace state | gentle pulse | 3s loop | Soft chime |

---

## 5. Color System (Direction C + B blend)

### Base palette

```
Background:   hsl(40 30% 96%)    — warm off-white
Card:         hsl(40 25% 98%)    — cream
Foreground:   hsl(40 20% 15%)    — warm dark
Muted:        hsl(40 10% 50%)    — warm gray
Primary:      hsl(15 70% 75%)    — soft peach/coral
Accent:       hsl(160 40% 75%)   — soft sage/mint
Surface:      hsl(var(--atmos-hue), 25%, 96%)
```

### Atmosphere system

The palette shifts based on how many objects are at home:

| State | Hue | Saturation | Lightness | Feel |
|---|---|---|---|---|
| Many out of place | 200 (blue) | 30% | 92% | Cool, alert |
| Some out of place | 120 (green) | 20% | 94% | Neutral |
| Most at home | 60 (warm) | 15% | 95% | Warm, calm |
| All at home | 40 (amber) | 25% | 97% | Serene, glowing |

The background, card tints, and accent colors all shift along this curve.

---

## 6. Typography

```
Scale:
Hero:    2.25rem / 2.75rem    (36/44px)   — Greeting, object name
Title:   1.5rem / 2rem         (24/32px)   — Page titles
Body:    1.125rem / 1.625rem   (18/26px)   — Reading text
Small:   0.875rem / 1.25rem    (14/20px)   — Labels, timestamps
Tiny:    0.75rem / 1rem        (12/16px)   — Chips, metadata

Font: Inter (system font stack fallback)
Weight: Light (300) for hero, Regular (400) for body, Medium (500) for CTAs
```

---

## 7. Spacing System

```
Space scale (in rem):
0.25 (4px)    — Micro gaps
0.5  (8px)    — Tight label-icon gaps
0.75 (12px)   — Compact touch spacing
1    (16px)   — Standard gap
1.25 (20px)   — Generous gap
1.5  (24px)   — Section spacing
2    (32px)   — Major sections
2.5  (40px)   — Page edges
3    (48px)   — Hero spacing
4    (64px)   — Large breathing room
```

---

## 8. Button System

### Primary CTA (The "one obvious action")

```
Height:    72px
Width:     100% (full width)
Radius:    16px (rounded-2xl)
Font:      1.125rem, Medium, 1.2 leading
Colors:    bg-primary, text-primary-foreground
Shadow:    var(--depth-1)
Press:     scale(0.97), spring damping 15 stiffness 400
Sound:     ceramic tap on press + wooden click on complete
Label:     Action verb + target (e.g., "Put Away", "Return to Closet")
```

### Secondary Button

```
Height:    56px
Radius:    14px (rounded-xl)
Style:     Outline or ghost
Font:      1rem, Regular
Press:     scale(0.95)
Uses:      "Move", "Skip", "Add Note"
```

### Icon Button (FAB, back, dismiss)

```
Size:      56px
Radius:    50% (rounded-full)
Style:     Elevated bg-card with shadow
Font:      1.5rem
Press:     scale(0.9)
Uses:      "+", "←", "✕"
```

---

## 9. Navigation Philosophy

The app has two modes: **Restore** and **Browse**.

**Restore mode** (default, primary):
- Shows one object at a time
- Single CTA: "Put Away" / "Return to [Space]"
- Sequential: complete one, next rises
- When all done: Peace state

**Browse mode** (secondary, discovered):
- Accessed via a subtle "Browse Home" text after peace state
- Shows zones as large tiles
- Tap to see storage spaces and objects within
- Read-only browsing — actions happen in Restore mode

**Bottom nav:**
- 3 tabs: **Home** (restore loop), **Journal** (diary + books), **Workshop** (customize)
- Browse lives within the Home tab as a secondary view
- Workshop is the only "tool" space — intentionally separated

---

## 10. Home Screen Concepts

### Concept: The Restore Loop

```
┌─────────────────────────────────┐
│                                 │
│         ☀️ Good Evening         │
│                                 │
│     3 things need attention     │
│                                 │
│        ┌─────────────┐          │
│        │     👔       │          │
│        │             │          │
│        └─────────────┘          │
│                                 │
│        Office Shirt             │
│     Laundry Basket · 2 days     │
│                                 │
│  ┌───────────────────────────┐  │
│  │      🏠 Return to         │  │
│  │      Office Wear          │  │
│  └───────────────────────────┘  │
│                                 │
│         + 2 more waiting        │
│                                 │
└─────────────────────────────────┘
```

After tapping the button:
```
┌─────────────────────────────────┐
│                                 │
│   [card compresses, dissolves]  │
│                                 │
│        ┌─────────────┐          │
│        │  next card   │          │
│        │  rises up    │          │
│        └─────────────┘          │
│                                 │
└─────────────────────────────────┘
```

After all objects restored:
```
┌─────────────────────────────────┐
│                                 │
│        ✨ Everything's          │
│        at peace                 │
│                                 │
│     [gentle pulsing glow]       │
│                                 │
│   ┌─────────────────────────┐   │
│   │   🏠 Browse Home        │   │
│   └─────────────────────────┘   │
│                                 │
│   (subtle, lower opacity)       │
│                                 │
└─────────────────────────────────┘
```

---

## 11. Object Interaction Concepts

The object card shows only what's needed:

1. **Large emoji/icon** — 80px, centered, in a soft circular container
2. **Object name** — Title weight, readable
3. **Current location** — Small text, muted
4. **Time since displaced** — Tiny text, if relevant

No status badges. No lifecycle labels. No metadata.

The only action is the CTA button below the card.

---

## 12. Journal Redesign

Journal should feel like a beautiful notebook.

**Entry list:** Large date headers. Each entry is a card with:
- Date (e.g., "July 1, 2026")
- First line of gratitude opening
- Tap to read full entry → full page, elegant typography
- Mic button for dictation (subtle, bottom-right)

**Entry reader:** Full page, centered typography, generous whitespace.
🙏 gratitude opening at top
Free blocks flow naturally
✨ optimism closing at bottom

**Entry editor:** Scrollable single page.
- Date at top
- "What are you grateful for?" — large text area with mic
- "Add block" — inserts free section with optional header
- "What are you looking forward to?" — large text area with mic
- Save button at bottom (large, pill)

**Books:** Collapsible section below entries.
- Filter pills: All / TBR / Reading / Read
- Simple cards: title, author, status badge
- Tap to expand notes
- Add form: minimal (title, author, status, notes)

---

## 13. Workshop Redesign

Workshop is not a settings page. It's a personal studio.

**Layout:** Grid of 4 large visual tiles, 2×2:

```
┌──────────────┐  ┌──────────────┐
│    🔄        │  │    📦        │
│  Lifecycles  │  │   Spaces     │
│  Laundry     │  │  Closet      │
│  Kitchen     │  │  Drawer      │
│  Travel      │  │  Shelf       │
└──────────────┘  └──────────────┘
┌──────────────┐  ┌──────────────┐
│    🏠        │  │    💾        │
│   Rooms      │  │   Data       │
│  Bedroom     │  │  Export      │
│  Kitchen     │  │  Import      │
│  Office      │  │  Backup      │
└──────────────┘  └──────────────┘
```

Each tile shows a preview of its content. Tap to drill in with a slide animation.

No list items. No cramped rows. Each sub-page uses the same large-card language.

---

## 14. Complete Design Rationale

### Why the Restore Loop?

Traditional organization apps fail because they ask the user to *browse before acting*. You open the app, see a dashboard, scan a list, find something to do, then do it. That's 4 cognitive steps before value.

The Restore Loop reduces it to 2:
1. Open app → see one object
2. Tap one button → feel satisfaction

**No browsing. No deciding. No scanning. Just restoring.**

### Why Large CTAs?

A 72px button is not a design choice — it's a commitment. It says "this is what you're here to do." It removes hesitation. The user doesn't wonder where to tap — the answer is visually undeniable.

### Why Atmospheric Rewards?

Numbers (streaks, XP, scores) are extrinsic motivation. They work short-term but create anxiety ("I lost my streak"). Atmospheric rewards are intrinsic — the interface itself becomes more peaceful as you restore order. The reward is *feeling* calmer, not *seeing* a number go up.

### Why No CRUD Language?

"Create," "Edit," "Delete," "Manage" — these are database words. They remind the user they're using software. The entire design philosophy is to make the software disappear. Natural language ("Put Away," "Return," "Add") keeps the user in their physical world.

### Why Three Tabs?

Home (restore) + Journal (reflect) + Workshop (customize) = three fundamental modes:
- **Restore:** Care for your physical space
- **Reflect:** Care for your mental space
- **Customize:** Shape the system to your life

Nothing else belongs. No analytics. No social. No separate browse tab (browse is a sub-mode of Home).
