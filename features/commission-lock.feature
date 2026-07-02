Feature: Commission lock
  The signed commission is the only human-authored contract in a bottega run.
  "bottega sign" freezes it. "bottega verify" polices it. Builders never touch it.

  Scenario Outline: Signing writes a lock that covers every feature file
    Given a repo with feature files "login.feature" and "billing.feature"
    When I run "bottega sign"
    Then the lock records <count> files
    And the lock entry for "login.feature" matches its content hash

    Examples:
      | count |
      | 2     |

  Scenario Outline: Verifying an untouched commission passes
    Given a signed repo containing "login.feature"
    When I run "bottega verify"
    Then it exits with <exit>

    Examples:
      | exit |
      | 0    |

  Scenario Outline: Drift after sign-off fails verification
    Given a signed repo containing "<file>"
    When the file "<file>" is <change>
    And I run "bottega verify"
    Then it exits with <exit>
    And the report marks "<file>" as "<status>"

    Examples:
      | file          | change   | exit | status   |
      | login.feature | modified | 1    | modified |
      | login.feature | deleted  | 1    | removed  |

  Scenario Outline: A feature file added after sign-off is drift
    Given a signed repo containing "login.feature"
    When a new feature file "<newfile>" is added
    And I run "bottega verify"
    Then it exits with <exit>
    And the report marks "<newfile>" as "<status>"

    Examples:
      | newfile       | exit | status |
      | extra.feature | 1    | added  |

  Scenario Outline: Verifying an unsigned repo fails loudly
    Given a repo with feature files "login.feature" and "billing.feature"
    When I run "bottega verify"
    Then it exits with <exit>

    Examples:
      | exit |
      | 2    |
