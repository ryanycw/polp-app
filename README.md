# Proof of Luma Protocol - NoirHack 2025

## About

Our **Proof of Luma Protocol (PoLP)** turns every Luma confirmation email into a permissionless, on‑chain credential. In just **three clicks, users connect their Gmail account and generate a zero‑knowledge proof of their confirmation email**. Armed with that proof, they can mint a POAP instantly—no follow‑up emails, no manual whitelists, no wallet gymnastics.

PoLP makes life easier for organizers as well. Instead of emailing mint links after the event, hosts **upload the event once—along with the POAP mint URL—before the doors even open**. Our backend stores the event hash and mint URL; when an attendee presents a valid zkEmail proof, the platform releases the mint automatically. Hosts can focus on crafting memorable experiences, while attendees enjoy a 24/7 self‑serve flow. Thanks to Aztec, the POAP mint URL and proof nullifier can even be hidden on‑chain, so no centralized service is needed to gate access.

Because every credential is generated with zero‑knowledge cryptography, **personal data stays private while authenticity stays ironclad**. Proof of Luma Protocol replaces fragmented and any additional workflows with a single, trustless pipeline—letting events celebrate attendance the moment it happens.

## Tech Stack

### zkEmail

zkEmail is the cryptographic bridge that links a Web2 inbox to an on‑chain identity while keeping every word of the email private selectively. To mint a POAP, a user simply signs in with Gmail on our platform, lets us pull their messages, selects the Luma confirmation mail, and generates a zero‑knowledge proof. The proof reveals only the sender and subject; everything else remains hidden. Once the contract validates that proof, the user can claim the POAP via the mint URL.

At the moment, the mint URL sits in our database, but in our understanding, with the launch of Aztec we can stash both the mint URL and each email’s nullifier privately on‑chain, releasing the link only after proof verification and blocking duplicate claims. The entire flow—email discovery, proof generation, and POAP minting—happens in one trustless pipeline with zero centralized servers.

Here is the part where zkEmail is [used](https://github.com/ryanycw/polp-app/tree/main/circuit/zkemail/src)

## References

### zkEmail

- [zkEmail Official Doc](https://docs.zk.email/introduction)
- [zkemail.nr](https://github.com/zkemail/zkemail.nr/blob/main/README.md)

### Luma

- [Luma OfficialAPI Docs](https://docs.lu.ma/reference/getting-started-with-your-api)

### POAP

- [POAP Official API Docs](https://documentation.poap.tech/docs/getting-started)
