# A defect-review loop on doctrine prose does not converge

What happened: the 2026-07-21 run consolidating the review method produced a diff that was almost entirely method prose. The integrated review's fix-and-rerun loop ran a panel and seven single-engine rechecks; all eleven accepted fixes held, no finding ever recurred after its fix, and every recheck still produced new findings, each less consequential, because a reviewer asked for landing-blocking defects in a rulebook can always imagine one more operational edge.

The rule: a diff that is only method prose gets one panel, its fixes, and one recheck; a finding arriving after that recheck is a follow-up by definition, filed, never another cycle. Code in the diff keeps the full until-clean loop.

Enforced: tracking issue https://github.com/vadimcomanescu/bottega/issues/90 (the rule needs a doctrine sentence and a pin; adding them after this run's review closure would have re-entered review).
