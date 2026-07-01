# domain-modeling
- Treat Lifecycles, Moments (states), and Storage Spaces as user-configurable templates with thoughtful defaults, never as hardcoded enums. Confidence: 0.80
- Model objects with permanent home, current location, and current state as separate independent variables, connected through event transitions. Confidence: 0.60
- For v1, a Moment belongs to exactly one Lifecycle; avoid premature normalization of reusing Moments across Lifecycles. Confidence: 0.70
- Storage Spaces should support hierarchical nesting (parent-child, e.g., Bedroom → Closet → Office Wear → Hanger), not flat lists. Confidence: 0.70
- Treat default Lifecycles, Moments, Storage Spaces, icons, colors, and example workflows as first-class design assets in seed data, not placeholder data. Confidence: 0.70
- Design all template data (Lifecycles, Moments, Storage Spaces) to support renaming, reordering, inserting, merging, and deleting without migrations or broken reference handling. Confidence: 0.70
- Journal entries must always start and end with gratitude and optimism (rule: "start and end with gratitude and optimism"); middle content is free-form with optional section headers. Confidence: 0.70
