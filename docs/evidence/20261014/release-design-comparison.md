# Portfolio release design comparison — 2026-10-14

## Scope

This evaluates the locally generated pages in monorepo PR #52 and the matching public-repository PR #4. Neither PR is live. The live `skmt3p.com` still serves the older GitHub Pages release. No award, universal design superiority, or production browser compatibility is claimed.

The [Webby Awards' 2026/2027 Websites and Mobile Sites criteria](https://www.webbyawards.com/judging-criteria/) assess content, structure/navigation, visual design, functionality, interactivity, innovation, and overall experience. Functionality explicitly includes cross-platform use, browser independence, access needs, and bandwidth. This review uses those criteria as a checklist, not an official score. The [Awwwards listing for Takafumi Senda](https://www.awwwards.com/sites/takafumi-senda-portfolio) shows an Honorable Mention; no current official FWA rubric was verified.

## Comparable works and method

The comparison task is to identify the person, find work, and reach contact on a portfolio homepage. The 2026-10-14 sources are [Bruno Simon's portfolio](https://bruno-simon.com/) by Bruno Simon and [Takafumi Senda's portfolio](https://takafumisenda.com/) by Takafumi Senda. Bruno's interactive 3D portfolio is a demanding creative-developer benchmark. Senda's awarded portfolio is a demanding Japanese visual-design benchmark. Their creative-client audiences differ from this Portfolio's engineering/product-management career audience, so a single overall rank would mislead.

Earlier live-browser inspection saw Bruno's loader but did not reach a controllable 3D scene. Senda's home exposed six work-detail links and did not overflow a 390px viewport; project details were not evaluated. These observations are limited to the cited sites at the inspection date, not their complete experiences.

## Release candidate evidence

- The locally generated English desktop page at 1280px and Japanese pages at 390px and 320px had no horizontal overflow. The hero video loaded and played in desktop and Japanese mobile variants. The order is video identity → career experience → work → contact. This gives a recruiter the role narrative before product exploration; its comparative task-time benefit remains unmeasured.
- The career disclosure is expanded by default, and the original project case material remains in the Work section. Three OmusBridge product links are visible, attributed to the company. The terminal palette and commands continue through navigation, sections, contact, and the 404 error state. This supports content and visual consistency; Senda offers more distinct work-detail destinations.
- The video control paused and resumed playback in the local browser. Simulated reduced-motion showed a poster and paused video. Blocking the mobile MP4 produced an error and retry path; after network restoration, retry loaded the video. These controls address bandwidth, motion, and error recovery, but simulation is not a physical-device test.
- The 404 route displayed a terminal error at the top without loading the hero video. The generated output uses content-hash URLs for CSS and JavaScript. Local typecheck, unit tests, CSS lint, and generation passed; PR-specific CI results are linked below.

### WebKit verification on 2026-10-14

Playwright WebKit 26.6 loaded the locally served Japanese page at 1280px, 390px, and 320px. Document width equaled viewport width in each case. At 1280px the video reached `readyState=4` and played; at 390px the mobile Japanese MP4 reached `readyState=4` and played. The Stop control paused it and changed to a Resume label. With `prefers-reduced-motion: reduce`, the video remained paused. The 320px reduced-motion viewport stayed within width; its [screenshot](./webkit-ja-320-reduced-motion.png) shows the readable terminal hero and controls. The 404 page at 320px had no video element, placed the path error in `#home`, and did not overflow. Both Portfolio CI runs passed: [monorepo PR #52](https://github.com/Skmt3P/skmt3p-monorepo/actions/runs/38554770267) and [public repo PR #4](https://github.com/Skmt3P/skmt3p/actions/runs/38554807859). This is an automated WebKit engine check, not a physical Safari/device check.

## Judgement and gaps

The release has a coherent terminal world and a directly readable career story across inspected states. Against the two selected creative portfolios, its strongest evidenced distinction is recruiter-oriented information order with explicit media controls and fallback. It does not establish that the visual craft, interaction, or innovation exceed Bruno's 3D world or Senda's awarded work. No matched-user timing, comprehension, independent juror review, Lighthouse measurement, physical iOS Safari test, or full comparator journey was completed. Production behavior remains unverified until the approved release route is used and checked. Award-level and global-superiority claims remain **unmet**.
