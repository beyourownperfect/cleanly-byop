# Taste (Continuously Learned by [CommandCode][cmd])

[cmd]: https://commandcode.ai/

# tech-stack
- Use React with TypeScript, Vite, Tailwind CSS v4, shadcn/ui, Motion, Zustand, Dexie.js (IndexedDB), and React Router for this PWA. Confidence: 0.65
- Use vite-plugin-pwa for installable offline-first PWA support. Confidence: 0.50
- Use the Web Speech API SpeechRecognition (browser built-in) for speech-to-text input in the journaling feature; do not use external TTS or cloud-based speech APIs. Confidence: 0.65

# architecture
- Use append-only event log (history table) as immutable audit log; cache current momentId/spaceId on the Object and update them atomically alongside each history event. Do NOT replay/fold events for primary reads. Confidence: 0.75
- Use Dexie's useLiveQuery for reactive data subscriptions from IndexedDB; all domain data stays in Dexie (never in a separate cache/state layer). Zustand holds only ephemeral UI state (scroll position, active zone, animation state). No React Query, Redux, or any caching layer for domain data. Confidence: 0.60
- Structure code with domain-driven modular architecture (zones, objects, homes, states, history as independent modules with schema/repository/store layers). Confidence: 0.60
- Structure the app as independent sibling top-level domain modules (e.g., homeos, journal, books), each with separate IndexedDB tables and domain logic, sharing only the app shell, design system, and database connection. Avoid cross-module coupling; use optional nullable foreign keys for minimal integration. Confidence: 0.65
- Keep journal and books modules completely independent with no cross-references, foreign keys, or linking between them. Confidence: 0.65
# ux
See [ux/taste.md](ux/taste.md)
# limitations
- Keep transitions generic across all Lifecycles; never introduce lifecycle-specific logic (no laundry timer, no reading progress, etc.) — if a feature cannot work for every Lifecycle, it does not belong in the app. Confidence: 0.70

