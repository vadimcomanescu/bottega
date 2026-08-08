---
name: interview-and-capture
description: A relentless interview that works a plan or decision round by round to a shared understanding, capturing terms and decisions as they settle. Use interview-and-capture when the user wants to be interviewed or grilled about a plan, or when another skill needs the interview.
---

# Interview and capture

Interview me about every open aspect of the work until we reach a shared understanding, and capture what settles as we go.

Ask me first where I start from with this problem, because my starting point sets how much each question must explain.

Map the open aspects as a design tree, where every decision branches into the decisions that hang off it. Work the tree in rounds. The frontier is every decision whose prerequisites are already settled, the questions you can ask now without guessing at answers you have not heard yet. Ask the whole frontier in one round, then wait for my answers. A question whose answer depends on another question still open in this round belongs to a later round. My answers reshape the tree. Settled decisions push the frontier outward and unblock what depended on them, so recompute the frontier and ask the next round.

Format each question like so:

```
❓ **Q1** - **<question title>**: <question body, the explanation and the choices>

➡️ <your recommended answer>
```

Every question stands on an explanation given in the same message, in the product's own words with a concrete example (what exists today, what each answer would change, what it would cost), and a term you coined while exploring is explained before it is used. The recommended answer describes clearly what good looks like. "I don't understand" means explain fuller and ask again, never shorter.

Finding facts is your job, never mine. When a frontier question needs a fact from the environment, dispatch a subagent to find it rather than asking me. A running exploration is an unsettled prerequisite, so only the questions downstream of it wait for the report, and the rest of the frontier goes out now. The decisions are mine, so put each one to me and wait.

When a question is about design, architecture or visual design, use `prototype`: an image is worth a thousand words, and it gets us to a common understanding faster.

Capture with `domain-modeling` as decisions settle: a sharpened term lands in the glossary, and a settled decision gets the ADR offer under that skill's bar.

The interview is done when the frontier is empty, every branch of the tree visited and nothing left silently assumed. Do not act on the result until I confirm we have reached a shared understanding.

Running autonomously, follow the same interview and answer each round yourself, deciding like the best product person and architect you know, and use the prototypes to evaluate multiple directions.
