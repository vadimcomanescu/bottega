# Deepening

How to deepen a cluster of shallow modules safely, given its dependencies. Uses the vocabulary in [SKILL.md](../SKILL.md): module, interface, seam, adapter. The method follows Matt Pocock's deepening reference.

## Classify the dependencies

Classify each dependency of the cluster. The category decides how the deepened module is tested across its seam.

1. **In-process.** Pure computation, in-memory state, no I/O. Always deepenable. Merge the modules and test through the new interface directly, with no adapter.
2. **Local-substitutable.** The dependency has a local test stand-in, such as an embedded database or an in-memory filesystem. Deepenable when the stand-in exists. Tests run the stand-in behind an internal seam, and the module's external interface carries no port.
3. **Remote but owned.** Your own service across a network boundary. Define a port at the seam. The deep module owns the logic, the transport is injected as an adapter, tests use an in-memory adapter, and production uses the network adapter. The logic sits in one deep module even though it is deployed across a network.
4. **True external.** A third-party service you do not control. This is the one case for a mock adapter: the module takes the dependency as an injected port, and tests provide the mock.

## Replace the tests, do not layer them

- Write the new tests at the deepened module's interface, asserting observable outcomes through it.
- Old unit tests on the shallow modules become waste once the interface tests cover the behavior. Delete them.
- A test that must change when the implementation changes is testing past the interface.
