# Watchman — project vocabulary: words that already exist in this field

The rule (no made-up words; actual name, cited term, or literal plain English; `[no standard term]` when none exists) and the known-coinage swap list live one level up in the repo's `CLAUDE.md` and globally in `~/.claude/CLAUDE.md`. This file is the positive half: use these words; do not coin alternatives.

Reach for these before inventing anything. Each has a citable home.

| Term | Source | Use it for |
| --- | --- | --- |
| stratum, strata | NTP (RFC 5905) | the time-source hierarchy: GPS = stratum 0, down to relative timing |
| adaptive frequency hopping (AFH), channel map, channel classification | Bluetooth Core Spec | avoiding bad channels; the set of usable channels; per-channel quality assessment |
| channel blacklisting | 6TiSCH / TSCH literature | the same mechanism in the industrial-mesh vocabulary |
| TSCH, slotframe, timeslot | IEEE 802.15.4e | slotted time; the repeating slot schedule |
| reference-broadcast synchronization (RBS) | Elson, Girod & Estrin 2002 | receivers syncing off a broadcast's arrival time |
| look-ahead window | HOTP, RFC 4226 | tolerating counter/clock drift when rejoining |
| deterministic backoff | TDMA / MAC literature | ordered collision resolution instead of random backoff |
| hop set, dwell time, 20 dB bandwidth | 47 CFR 15.247 | the regulatory quantities, named as the rule names them |
| carrier sense, channel-activity detection (CAD) | radio / Semtech SX126x | listen-before-talk |
| repetition coding | coding theory | sending the same frame several times for reliability |
| supervision, supervised circuit, supervisory signal, trouble condition | NFPA 72 | a missing heartbeat is itself the alarm — the Watchman thesis |
| three-conductor circuit, conductors P, N and S | US 1,950,108 (Howe Mfg, filed 1927, granted 1934) | the whole Harrington circuit; the patents never name it beyond this, so this is the honest handle (short form: the P–N–S circuit). Do not write "Harrington's loop" or "Class-A loop" for the whole |
| box operating circuit (P–N), signaling circuit / signaling loop (S), signal circuit test relay | US 2,202,853 (Autocall Co., filed 1936, granted 1940) | the parts; "loop" attaches to S only, never the bundle |
| line side / return side; +L, +R, −L, −R terminals | US 1,950,108 | the positive/negative line and return convention |
| common wire c, trouble wire t, trouble-corrected wire o | US 2,202,853 | the 1936 trio = normal / trouble / restored; the citation behind "silence is itself an alarm" |
| supervisory signal, trouble signal, restoration, supervised circuit, Class A circuit | NFPA 72 | modern equivalents of the above — label them as equivalents, never as Harrington's terms (NFPA class designations postdate the patents) |
| proprietary supervising station | NFPA 72 | the modern equivalent of the plant-protection central panel, as against a municipal or central-station system |
| transmitter circuit (main / supervisory) | later Autocall usage, read from a C-957ACL terminal-block photo | UNVERIFIED — confirm before citing |
| cell, cell site | cellular radio | allowed in radio context; the global ban is on "cell" as a coinage for an environment |
| guard interval, retune | radio engineering | slot-edge margin; changing frequency |

