---
name: Dynamic Trust content framework
description: Master content rules for all site copy - voice, structure, authority signals, freshness, formatting constraints
type: preference
---

## Purpose
Build parent trust by signalling that School Direct went further than the schools themselves to surface data, analytics, and detail. Content must be eligible for AI retrieval (SGE, LLM citations) and easy to extract as fragments.

## Voice and language
- South African second-language English. Plain, simple words. Short sentences.
- No big words. No idioms a non-native reader would miss.
- Confident, declarative SME tone. No "might", "could", "perhaps", "it is possible that".
- No filler intros ("In today's fast-paced world", "Welcome to", "Are you looking for").
- Start every section with the answer.

## Forbidden characters
Never output: em dash, en dash, curly quotes, non-breaking space, zero-width space, zero-width joiner, soft hyphen, or any invisible Unicode. Use straight ASCII quotes and a normal hyphen only.

## Entity authority
Reference recognised SA education entities to anchor content in the authoritative candidate set:
- Department of Basic Education (DBE)
- Provincial Education Departments (GDE, WCED, KZN DoE, etc.)
- EMIS (Education Management Information System) numbers
- ISASA (Independent Schools Association of Southern Africa)
- SGB (School Governing Body)
- Section 21 status
- Quintile system (Q1 to Q5, no-fee vs fee-paying)
- NSC (National Senior Certificate) results
- Umalusi

## First-party signals
Cite our own dataset as proprietary evidence:
- "Our directory of 3,082 schools..."
- "From our EMIS-level records..."
- "Across the districts we cover..."
- "In our 2025 dataset we found..."
- "Our walk-in centre index shows..."
Use specific numbers, not rounded vague claims.

## Freshness
Anchor to 2026 where the topic is time-sensitive (admissions cycles, fee changes, policy shifts). Note where information is reviewed or updated.

## Structure for AI extraction
- Clear H1, H2, H3 hierarchy with descriptive headings phrased as the question or topic.
- One idea per paragraph. Each paragraph must work as a standalone answer.
- Lead-in rule: the first sentence of each section is the takeaway.
- Use Markdown tables for comparisons (sectors, phases, quintiles, fees).
- Use bulleted or numbered lists for steps and criteria.
- Write attribution-ready sentences: "The primary factor for X is Y because Z."

## Apply to
Page titles, meta descriptions, hero copy, section headings, school detail pages, About, FAQs, blog posts, error and empty states, button labels where space allows.
