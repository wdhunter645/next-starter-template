# Complete upstream source workspace

Collected for LGFC Issue #2878.

These directories are pinned Git submodules containing complete upstream repositories. Clone with:

```bash
git clone --recurse-submodules <LGFC repository URL>
```

For an existing clone:

```bash
git submodule update --init --recursive
```

Classification:

- `permissive/`: candidates for controlled adoption or adaptation after file-level license, security, dependency, and architecture review.
- `file-copyleft/`: components whose covered files and modifications must retain their license terms.
- `restricted/`: reciprocal-license/reference systems. Do not copy their implementation into LGFC runtime code without an explicit legal and architectural decision.

A submodule's own LICENSE, notices, history, and upstream attribution remain authoritative. No submodule is connected to production routes or package manifests by this collection commit.
