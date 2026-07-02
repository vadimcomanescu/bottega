---
name: designing
description: Bottega's shared design vocabulary — module, interface, depth, seam, deletion test. Loaded by the maestro when designing a spine and by every reviewer judging architectural conformance; dossier interface contracts are written in these terms.
---

# Designing

*One vocabulary on both sides of the dispatch seam: the maestro designs in it, the dossier carries it, the reviewer judges by it. Use these terms exactly — never "component", "service", "API", or "boundary".*

- **Module** — anything with an interface and an implementation: a function, class, package, or slice. Scale-agnostic.
- **Interface** — everything a caller must know to use the module correctly: signature, invariants, ordering constraints, error modes, required configuration, performance traits. Never just the type surface.
- **Depth** — behavior per unit of interface a caller must learn. Deep = much behavior behind a small interface. Shallow = interface nearly as complex as the implementation — inline it.
- **Seam** — a place behavior can change without editing in place. One adapter = hypothetical seam; two = real. Never cut a seam where nothing varies.
- **Deletion test** — delete the module mentally: if complexity just vanishes, it was hiding nothing (negative code); if it reappears across callers, it earns its place.
- **Design it twice** — before committing to an interface, sketch a second, radically different one; keep whichever is simpler for callers, whatever it costs the implementation.
