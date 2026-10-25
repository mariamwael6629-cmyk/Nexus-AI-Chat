# Product

<!-- impeccable:product-schema 1 -->

> Inferred from the README and `nexus-ai-chat.html`. The owner asked the redesign to proceed on inferred context; treat each line as an assumption until confirmed.

## Platform

web

## Users
Developers and knowledge workers who chat with an assistant every day and are tired of re-explaining their stack, projects and preferences. They work in long sessions on a laptop.

## Product Purpose
Nexus AI is a memory-first chat app: conversations, a memory centre (browse, search, filter by Preferences, Work & Skills, Projects, Profile, Interests; edit and delete), a "Save to memory" action on replies, a dashboard of real counts and 7-day activity, and a settings page with four response personalities. A landing page and auth come first.

## Positioning
It remembers you. Saved facts are used in later replies.

## Capabilities and Constraints
- Single `nexus-ai-chat.html` (inline CSS/JS), FastAPI backend with JWT. Replies come from a deterministic template responder that uses stored memories; no external LLM is called (the landing copy must not claim otherwise beyond what it already says).

## Brand Commitments
- Name "Nexus AI".

## Evidence on Hand
- Landing claims and pricing in the HTML are placeholder marketing copy; do not add more.

## Product Principles
1. Memory is visible and editable, never hidden.
2. The conversation stays the main surface.
3. Plain, friendly language.
