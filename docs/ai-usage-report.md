# AI Usage Report – Assignment 3

**Student:** Bader Alghamdi | **ID:** 202358650


---

## 1. Tools Used & Use Cases

| Tool | How I used it |
|------|---------------|
| Claude (Sonnet 5.5) | Step-by-step guidance on moving the project cards from HTML into JavaScript; a skeleton outline for `script.js` and for `styles.css`; code review of `index.html`, `script.js` and `styles.css` (bugs, accessibility, contrast, requirement checklist); help structuring this report. |


## 2. Benefits & Challenges

**Benefits:**
I asked Claude to guide me instead of giving me code. For moving the cards into JavaScript, it gave me the steps and a skeleton with TODOs, and I wrote the code myself. Because of that, I actually understand how the data, the filters and the rendering fit together.

The reviews also caught bugs I missed: a wrong theme button label on load, the tab switch running twice, dates showing the wrong month in some timezones, and CSS still styling `h3` after I switched to `h2`. It also pointed out low contrast in dark mode, and that my form said "message sent" when nothing was sent. I changed that to a clear demo message.

**Challenges:**
The AI can't run my site. It only sees what I paste, so I tested everything myself and ran Lighthouse myself. When I asked about CSS without sharing the file, the answer was too general. The reviews were sometimes long, so I had to choose what to fix first. My first documentation tables also didn't match my final code, and I had to fix them against the real files.

## 3. Learning Outcomes

- **Rendering from data:** projects live in an array, so adding one is just adding an object. That's also what makes filtering possible.
- **One state object:** every control updates `filters` and calls `renderProjects()`, so the page always shows the same result for the same filters.
- **localStorage:** the theme is a plain string because the `<head>` script reads it before the page loads. Everything else goes through my JSON `storage` helper with try/catch.
- **Validation:** each field has a rule that returns an error message, and `aria-invalid` marks bad fields for styling and screen readers.
- **API errors:** a timeout, a `response.ok` check, a JSON shape check, and a retry button if anything fails.
- 

## 4. Responsible Use & Modifications

I didn't paste AI code straight into my project. For the main JavaScript work I asked for guidance only, and Claude gave me steps and a skeleton with TODO comments. I wrote the functions myself: the project data, the filter and sort pipeline, the card builder, the quote API and the form validation. I also added things on my own, like the tags and level on each card, two extra projects, and the quote feature, which I tested and got working before asking for a review.

After each version I pasted my code for review. I didn't just accept the list. I went through each point, checked it against my code, and fixed it myself. The fixes I made after reviews:
- Validated the saved filters from localStorage, so a bad or old value falls back to the default instead of breaking the page.
- Added `timeZone: "UTC"` to the date formatting so the month doesn't change by timezone.
- Made tab switching go through `hashchange` only, so it doesn't run twice.
- Stopped saving the search text, since it's temporary.
- Changed card titles from `h3` to `h2` and updated the CSS to match.
- Changed the contact form message to say it's a demo, because it said "sent" when nothing was sent.
- Moved `showTab` to run first on page load.


To check that the code actually works, I tested it myself in the browser and watched the console for errors after each change. I ran Lighthouse and got 100 in Performance, Accessibility, Best Practices and SEO. 

For the documentation, the AI helped me with the structure and drafted parts of the text. I edited it so it matches my real code and my own experience, and I corrected the parts that didn't match. All of this is listed in the usage log, and the full, unedited conversation is in my evidence ZIP. I made sure I can explain every part of my code without looking at it.

## 5. Usage Log

One row per conversation (`C`) or AI-generated artifact (`A`).

| ID | Tool (model) | Date | Purpose | Files affected | What you changed and how you verified it |
|----|--------------|------|---------|----------------|------------------------------------------|
| C01 | Claude (Sonnet 5.5 / Opus 5.5) | 2026-11-21 | Guidance and code reviews | `index.html`, `script.js`, `styles.css` | Wrote the code myself and fixed the review bugs; tested in the browser and with Lighthouse (100) |
| A01 | Claude (Sonnet 5.5) | 2026-11-21 | `script.js` skeleton (TODOs only) | `script.js` | Wrote all the function bodies myself |
| A02 | Claude (Sonnet 5.5) | 2026-11-21 | Technical documentation | `docs/technical-documentation.md` | Checked it against my code and added my test results |
| A03 | Claude (Opus 5.5) | 2026-11-21 | Report text, sections 2–4 | `docs/ai-usage-report.md` | Edited it to match what I actually did |

---

## 6. AI Usage Declaration

I declare that this report and the attached evidence document all of my AI use in this assignment, with complete and unedited conversations, and that I understand and can explain all the code I submitted. I understand that undeclared AI use or a false declaration will be treated as plagiarism according to KFUPM regulations.

**Name:** Bader Alghamdi
**ID:** 202358650
**Date:** 2026-11-21
