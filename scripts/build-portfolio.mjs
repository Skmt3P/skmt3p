import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

// Reuse the Markdown engine of the already declared PDF renderer.
const { marked } = createRequire(import.meta.resolve('md-to-pdf'))('marked')

const docs = fileURLToPath(new URL('../docs/', import.meta.url))
const copy = {
  en: {
    skip: 'Skip to content',
    work: 'Selected products',
    about: 'Experience',
    contact: 'Get in touch',
    title:
      '<span>Ideas in.</span><span>Products out<span class="cursor" aria-hidden="true">_</span></span>',
    intro:
      'I’m Ryu Sakamoto. I connect business, people and software — from an idea to something people can use.',
    statement: 'Small tools.\nRoom for possibility.',
    description:
      'Two products from OmusBridge: a space to write, and a way to learn through everyday scenes.',
    role: 'OmusBridge · Product development',
    more: 'Explore the product',
    visit: 'Visit product',
    kakiba: 'A place for the next thought.',
    kakibaText:
      'A web-based writing space for turning thoughts into documents. Search and an editor sit within the same workspace.',
    kakibaDetail:
      'The central design question is how to keep the act of writing in focus while making saved documents easy to find. The public interface brings account access, search and the document workspace together.',
    langle: 'A language begins with a scene.',
    langleText:
      'Choose a lesson, work through phrases and follow your progress. Everyday scenes give the learning material a shared context.',
    langleDetail:
      'Rather than presenting only a vocabulary list, Langle organizes learning around illustrated situations. Lessons, answers and progress form a repeatable path through the material.',
    expertise: 'Across the whole delivery.',
    skills: [
      [
        '01',
        'Shape the work',
        'Requirements, planning and the decisions that connect a business need to an achievable product.',
      ],
      [
        '02',
        'Build the system',
        'Web architecture and implementation with Vue, Nuxt and TypeScript.',
      ],
      [
        '03',
        'Move it forward',
        'Team leadership, delivery and continuous improvement with AI-assisted workflows.',
      ],
    ],
    resume: 'The experience behind the work.',
    resumeText:
      'Project management, engineering and business operations. Read the full background below.',
    read: 'Career, activities & qualifications',
    source: 'Text résumé',
    contactTitle: 'A problem worth working on?',
    contactText:
      'Professional background, code, everyday updates and the company I build.',
    top: 'Back to top',
    caption: 'Development preview',
    responsibility:
      'My work at OmusBridge spans product planning, MVP exploration and web development. These interfaces are being refined with Codex.',
    caseLabels: ['Design question', 'Decision', 'Check'],
    cases: {
      Kakiba: [
        'Writing and rereading ask for different kinds of attention. A long draft also needs a way to keep your place.',
        'Keep the same draft in writing and reading views. A paragraph ruler marks your place and moves through the text without changing it.',
        'Desktop and mobile checks confirmed paragraph navigation and exact text preservation when returning to editing. The guest trial is not saved.',
      ],
      Langle: [
        'See how different languages express the same everyday scene.',
        'Keep the illustration in place. Hide the phrase and comparison to recall it from the scene, then reveal the words to check.',
        'Desktop and mobile checks confirmed hide, recall and reveal. Changing the language restores the phrase, with the same scene as its reference.',
      ],
    },
  },
  ja: {
    skip: '本文へ移動',
    work: 'プロダクト',
    about: '経歴と専門領域',
    contact: '連絡先',
    title:
      '<span>考える。</span><span>つくる。動かす<span class="cursor" aria-hidden="true">_</span></span>',
    intro:
      'Ryu Sakamoto。事業と人、ソフトウェアの間に立ち、アイデアを実際に使えるプロダクトへつなぎます。',
    statement: '小さな道具から、\nできることを広げる。',
    description:
      '書くための場所と、場面から学ぶ語学。OmusBridgeで取り組む二つのプロダクトです。',
    role: 'OmusBridge · 自社プロダクト開発',
    more: 'プロダクトについて',
    visit: 'プロダクトを開く',
    kakiba: '次の考えを、書きとめる。',
    kakibaText:
      '考えを文章にするためのWeb上の作業場所。文書を探す検索と、書くための編集画面を一つの場所にまとめます。',
    kakibaDetail:
      '書くことに集中でき、残した文書にも戻りやすい。その両立が設計のテーマです。公開インターフェースは、アカウントへの入口、検索、文書の作業場所を中心に構成しています。',
    langle: '言葉を、場面から覚える。',
    langleText:
      '教材を選び、フレーズに取り組み、進み具合を確かめる。日常の場面を手がかりに、言葉を学ぶプロダクトです。',
    langleDetail:
      '単語の一覧だけではなく、イラストで描く場面を学習の手がかりにしています。教材、回答、進捗を一つの流れにして、繰り返し取り組める構成です。',
    expertise: '<span>構想から、</span><span>動くところまで。</span>',
    skills: [
      [
        '01',
        '実行できる計画へ',
        '要件整理、計画、合意形成。事業の目的を、実現可能なプロダクトへ落とし込みます。',
      ],
      [
        '02',
        '仕組みをつくる',
        'Vue・Nuxt・TypeScriptを中心に、Webの設計から実装まで取り組みます。',
      ],
      [
        '03',
        '継続して前へ進める',
        'チーム運営、デリバリ、業務改善。AIを活用した開発と運用にも取り組んでいます。',
      ],
    ],
    resume: '仕事を支える、これまでの経験。',
    resumeText:
      'プロジェクトマネジメント、エンジニアリング、事業運営。詳しい経歴をまとめています。',
    read: '職歴・活動・資格を読む',
    source: 'テキスト版の経歴',
    contactTitle:
      '<span>一緒に考えたい課題は、</span><span>ありますか。</span>',
    contactText:
      '仕事の経歴、コード、日々の活動、運営する会社。各プロフィールはこちらから。',
    top: '先頭へ戻る',
    caption: '開発中の画面',
    responsibility:
      'OmusBridgeでは事業計画、MVP検討、Web開発を担当。ここで紹介する画面は、Codexとともに改善を進めています。',
    caseLabels: ['課題', '設計判断', '確認したこと'],
    cases: {
      Kakiba: [
        '書く時と、読み返す時では、文章への向き合い方が違う。長い原稿では、読んでいる位置も見失いやすい。',
        '原稿を保ったまま、書く面から読む面へ。段落の読み尺で現在地を示し、文章の流れを追えるようにしました。',
        'PCとスマートフォンで段落移動と、編集へ戻った時の本文一致を確認。サインイン前の試用文は保存されません。',
      ],
      Langle: [
        '同じ場面を、違う言語ではどう表すのか。',
        '同じ絵の中で言葉を読み、発話と比較欄を隠して思い出す。場面と日本語を手掛かりに、答えを確かめる見開きへ。',
        'PCとスマートフォンで、隠す・思い出す・確かめる操作を確認。言語を切り替えると、同じ場面で発話を再び読めます。',
      ],
    },
  },
}
for (const [locale, t] of Object.entries(copy)) {
  const ja = locale === 'ja'
  const prefix = ja ? '../' : './'
  const dir = ja ? `${docs}ja/` : docs
  const md = (await readFile(`${dir}README.md`, 'utf8')).replace(
    /^---[\s\S]*?---\n?/,
    ''
  )
  // Keep the visible directory in sync with the full source résumé.
  const contactStart = md.indexOf('<a id="topic7"')
  if (contactStart === -1) throw new Error(`Missing contacts anchor: ${locale}`)
  const contactSource = md.slice(contactStart)
  const contacts = [
    ...contactSource.matchAll(/<a href="(https?:[^"<>]+)"[^>]*>([^<]+)<\/a>/g),
  ]
  if (!contacts.length) throw new Error(`Missing contact directory: ${locale}`)
  const contactLinks = contacts
    .map(
      ([, url, label]) =>
        `<a href="${url}"><span>${label}</span><span aria-hidden="true">↗</span></a>`
    )
    .join('')
  const start = md.indexOf('<a id="topic2"')
  if (start === -1) throw new Error(`Missing résumé anchor: ${locale}`)
  const resume = marked
    .parse(md.slice(start), { breaks: true, gfm: true })
    .replace(/<a id="(topic\d+)" href="#[^"]+"><\/a>/g, '<span id="$1"></span>')
    .replace(
      /(?:<p>)?<span id="(topic\d+)"><\/span>(?:<\/p>)?\s*<h2[^>]*>/g,
      '<h2 id="$1">'
    )
    .replace(/<img([^>]*?)>/g, (img) =>
      img.includes('alt=') ? img : img.replace('<img', '<img alt="OmusBridge"')
    )
  const product = (
    name,
    text,
    detail,
    url,
    number
  ) => `<article class="project" aria-labelledby="${name}-title">
    <div class="window-bar"><span aria-hidden="true">├─</span><span>~/work/${name.toLowerCase()}</span><span aria-hidden="true">↗</span></div>
    <div class="project-heading"><span class="project-number">${number}</span><div><p class="eyebrow">${
    t.role
  }</p><h3 id="${name}-title">${name}</h3></div><a class="project-arrow" href="https://${url}" aria-label="${name} — ${
    t.visit
  }">↗</a></div>
    <p class="project-tagline">${text}</p><p>${
    t[name.toLowerCase() + 'Text']
  }</p>
    <details><summary>${t.more}</summary><p>${detail}</p><p>${
    t.responsibility
  }</p><a href="https://${url}">${t.visit} ↗</a></details>
  </article>`
  const trace = `<section id="trace" class="decision-trace" aria-labelledby="trace-heading">
  <div class="trace-heading"><div><p class="eyebrow">$ trace --from=question --to=product</p><h3 id="trace-heading">${
    ja ? '判断の中を、歩く。' : 'Step inside a decision.'
  }</h3></div><p>${
    ja
      ? '課題・判断・検証を選ぶと、設計の意図が見えてきます。'
      : 'Explore the question, decision and evidence behind the interface.'
  }</p></div>
  <div class="trace-projects" aria-label="${
    ja ? '事例を選択' : 'Choose a case'
  }" hidden>${['Kakiba', 'Langle']
    .map(
      (name, index) =>
        `<button type="button" data-trace-project="${name}" aria-pressed="${
          index === 0
        }"><span>0${index + 1}</span> ${name}<small>${
          name === 'Kakiba'
            ? ja
              ? '書き始めるまで'
              : 'Beginning to write'
            : ja
            ? '最初の一問まで'
            : 'The first question'
        }</small></button>`
    )
    .join('')}</div>
  ${['Kakiba', 'Langle']
    .map(
      (name) =>
        `<article class="trace-case" data-trace-case="${name}" aria-label="${name}"><div class="trace-route">${t.cases[
          name
        ]
          .map(
            (text, i) =>
              `<section class="trace-step" data-step="${i}"><h4><span class="trace-node">0${
                i + 1
              }</span>${t.caseLabels[i]}</h4><span class="trace-hint">${
                ['QUESTION', 'DECISION', 'IN PRACTICE'][i]
              }</span><p>${text}</p></section>`
          )
          .join(
            ''
          )}</div><div class="trace-inspect"><div class="trace-status"><span>~/work/${name.toLowerCase()}/decision.log</span><span class="trace-position" aria-hidden="true">01 / 03</span></div><div class="trace-output" hidden><p class="trace-stage"></p><p class="trace-copy" aria-live="polite"></p></div><figure><img src="${prefix}static/work/${name.toLowerCase()}-trace-0.webp?v=iter6" data-trace-image="${prefix}static/work/${name.toLowerCase()}-trace-" alt="${name} — ${
          t.caption
        }" width="1440" height="1000" loading="lazy" /><figcaption>${
          t.caption
        } · ${
          ja
            ? '操作の実画面 — 段階を選んで比較'
            : 'Recorded interface — select a step to compare'
        }</figcaption></figure><a href="#${name}-title">${
          ja ? 'プロダクトの説明を読む' : 'Read the product story'
        } →</a></div></article>`
    )
    .join('')}
  </section>`
  const html = `<!doctype html>
<html lang="${locale}"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Ryu Sakamoto — ${
    ja ? '技術と事業をつなぐ' : 'Technology & delivery'
  }</title>
<meta name="description" content="${
    t.intro
  }" /><meta name="theme-color" content="#0c1512" />
<link rel="icon" href="${prefix}static/favicon.svg" type="image/svg+xml" /><link rel="stylesheet" href="${prefix}static/portfolio.css?v=decision-10" />
<link rel="alternate" hreflang="en" href="https://skmt3p.com/" /><link rel="alternate" hreflang="ja" href="https://skmt3p.com/ja/" />
</head><body id="top"><a class="skip-link" href="#content">${t.skip}</a>
<div class="terminal-shell"><div class="terminal-top"><span class="terminal-lights" aria-hidden="true"><i></i><i></i><i></i></span><a class="session-brand" href="#top" aria-label="skmt3p — ${
    ja ? 'ホーム' : 'Home'
  }"><img src="${prefix}static/identity.svg" width="28" height="28" alt="" /></a><span class="session-title">skmt3p@portfolio: ~ <span class="session-kind">— terminal session</span></span><button class="motion-toggle" type="button" hidden aria-pressed="false">${
    ja ? '動きを止める' : 'Pause motion'
  }</button></div>

<header class="site-header"><a class="identity" href="#top"><img class="identity-mark" src="${prefix}static/identity.svg" width="34" height="34" alt="" /><span class="identity-name">skmt3p</span><span class="host">@portfolio</span></a><nav aria-label="${
    ja ? 'メイン' : 'Main'
  }"><a href="#top">[ ~ ]</a><a href="#work">[ work ] <span>${
    t.work
  }</span></a><a href="#experience">[ experience ]</a><a href="#contact">${
    t.contact
  } ↗</a><a href="#command-line" aria-label="${
    ja ? 'コマンド入力へ' : 'Command input'
  }">[ $ ]</a></nav><nav class="languages" aria-label="Language"><a href="${prefix}" ${
    !ja ? 'aria-current="page"' : ''
  }>EN</a><a href="${prefix}ja/" ${
    ja ? 'aria-current="page"' : ''
  }>JA</a></nav></header>
<div class="terminal-workspace"><aside class="file-tree" aria-label="${
    ja ? 'ファイル案内' : 'File explorer'
  }"><p class="tree-title">~/portfolio</p><a href="#top"><span>├─</span> whoami</a><a href="#work"><span>├─</span> work/ <small>02</small></a><a class="tree-child" href="#Kakiba-title">│  ├─ kakiba</a><a class="tree-child" href="#Langle-title">│  └─ langle</a><a href="#experience"><span>├─</span> experience</a><a href="#contact"><span>└─</span> connect</a><div class="tree-note"><span>READ / EXPLORE</span><p>${
    ja
      ? '事業と人と技術を、<br />つなぐ仕事の記録。'
      : 'A record of connecting<br />business, people & code.'
  }</p><a href="#command-line">$ help ↵</a></div></aside><main id="content" tabindex="-1"><section id="home" class="hero wrap" aria-labelledby="intro-heading">
<div class="terminal-body"><div class="intro-pane"><p class="command-label"><span>~</span> $ whoami</p><p class="eyebrow">RYU SAKAMOTO / TPM × FDE</p><h1 id="intro-heading">${
    t.title
  }</h1><p class="intro-copy">${
    t.intro
  }</p><section class="hero-proof" aria-label="${
    ja ? 'Kakibaの設計実例' : 'Kakiba design case'
  }"><div class="proof-heading"><span>01 / KAKIBA</span><span>${
    ja ? '企画・設計・実装 / with Codex' : 'PRODUCT DESIGN & BUILD / with Codex'
  }</span></div><div class="visual-legend bridge-controls" hidden aria-label="${
    ja ? '仕事の領域を選択' : 'Explore areas of work'
  }">${['THINK', 'BUILD', 'CONNECT']
    .map(
      (label, i) =>
        `<button type="button" data-bridge-stage="${i}" aria-pressed="${
          i === 1
        }" data-description="${t.skills[i][2]}">0${i + 1} / ${label}</button>`
    )
    .join(
      ''
    )}</div><div class="proof-pair"><div class="proof-words"><p class="proof-label">${
    t.caseLabels[1]
  }</p><p class="proof-copy" aria-live="polite">${
    t.cases.Kakiba[1]
  }</p></div><a class="proof-image-link" href="#trace" aria-label="${
    ja ? '判断記録で実画面を詳しく見る' : 'Inspect the full design decision'
  }"><img class="proof-image" src="${prefix}static/work/kakiba-hero-1.png?v=decision10" alt="${
    ja ? 'Kakiba: 段落の読み尺と原稿' : 'Kakiba: paragraph ruler and draft'
  }" width="1440" height="1000" /><span>${
    ja ? '実画面 ↗' : 'ACTUAL UI ↗'
  }</span></a></div><p class="proof-choice">${
    ja
      ? '書く・読むを別の原稿に分けず、同じ本文を往復する設計。'
      : 'Two views of one draft, instead of separate copies to write and read.'
  }</p></section><div class="quick-commands"><a href="#work"><span aria-hidden="true">↳</span> ./work <small>${
    t.work
  }</small></a><a href="#experience">cat experience <small>${
    ja ? '経歴を読む' : 'Read résumé'
  }</small></a></div><a class="bridge-example" href="#trace"><span>${
    ja ? 'この判断を、実例で見る' : 'See the decisions in practice'
  }</span><code>BUILD → trace/02 ↘</code></a></div>
<figure class="signal-visual"><div class="visual-top"><span>IDEA → SYSTEM → PRODUCT</span><span aria-hidden="true">[ ASCII ]</span></div><canvas id="signal-canvas" width="680" height="480" aria-hidden="true"></canvas><pre class="ascii-fallback" aria-hidden="true">       /&#92;        /&#92;
      /  &#92;______/  &#92;
     /______________&#92;
    /|  |  |  |  |  |&#92;
   /_|__|__|__|__|__|_&#92;</pre><figcaption>${
     ja
       ? '人と技術のあいだに、橋をかける。'
       : 'Connecting people, technology and ideas.'
   } </figcaption><div class="bridge-views" hidden aria-label="${
    ja ? '橋の視点' : 'Bridge viewpoint'
  }"><span aria-hidden="true">VIEW /</span>${[
    ['space', ja ? '透視' : 'Space'],
    ['plan', ja ? '平面' : 'Plan'],
    ['side', ja ? '側面' : 'Side'],
  ]
    .map(
      ([view, label]) =>
        `<button type="button" data-bridge-view="${view}" aria-pressed="${
          view === 'space'
        }">${label}</button>`
    )
    .join('')}</div></figure></div>

</section>
<section id="work" class="work wrap" aria-labelledby="work-heading"><div class="section-title"><p class="eyebrow">$ ls ./work/ <span class="command-comment"># ${
    t.work
  }</span></p><div><h2 id="work-heading">${t.statement.replace(
    '\n',
    '<br />'
  )}</h2><p>${
    t.description
  }</p></div></div>${trace}<div class="projects">${product(
    'Kakiba',
    t.kakiba,
    t.kakibaDetail,
    'kakiba.omusb.app/',
    '01'
  )}${product(
    'Langle',
    t.langle,
    t.langleDetail,
    'langle.omusb.app/',
    '02'
  )}</div></section>
<section id="experience" class="experience wrap" aria-labelledby="experience-heading"><div class="section-title"><p class="eyebrow">$ cat experience <span class="command-comment"># ${
    t.about
  }</span></p><h2 id="experience-heading">${
    t.expertise
  }</h2></div><div class="expertise">${t.skills
    .map(
      ([n, h, p]) =>
        `<article><span class="project-number">${n}</span><h3>${h}</h3><p>${p}</p></article>`
    )
    .join('')}</div><nav class="resume-directory" aria-label="${
    ja ? '経歴の目次' : 'Résumé contents'
  }">${[
    ['topic2', ja ? '職務要約' : 'Summary'],
    ['topic3', ja ? 'コアスキル' : 'Core skills'],
    ['topic4', ja ? '職務経歴' : 'Career'],
    ['topic5', ja ? '補足活動' : 'Activities'],
    ['topic6', ja ? '資格' : 'Qualifications'],
  ]
    .map(([id, label]) => `<a href="#${id}">${label} ↗</a>`)
    .join(
      ''
    )}</nav><details class="resume"><summary><span><span class="file-label">experience.md</span> ${
    t.resume
  }</span><span class="resume-action">${
    t.read
  }</span></summary><div class="resume-intro"><p>${
    t.resumeText
  }</p><a href="./README.md">${
    t.source
  } ↗</a></div><div class="reading-column">${resume}</div></details></section>
<section id="contact" class="contact wrap" aria-labelledby="contact-heading"><p class="eyebrow">$ open connect <span class="command-comment"># ${
    t.contact
  }</span></p><h2 id="contact-heading">${t.contactTitle}</h2><p>${
    t.contactText
  }</p><div class="contact-links">${contactLinks}</div></section></main></div>
<div class="command-dock" id="command-line"><form id="terminal-command" hidden><label for="command-input">visitor@skmt3p:~ $</label><input id="command-input" name="command" autocomplete="off" spellcheck="false" maxlength="80" placeholder="help / work / about / contact" aria-describedby="command-help" /><button type="submit">${
    ja ? '実行' : 'Run'
  } <span aria-hidden="true">↵</span></button></form><p id="command-help">${
    ja
      ? 'コマンドでも、リンクのクリックでも探索できます。'
      : 'Explore with commands, or simply follow the links.'
  }</p><p id="command-result" role="status"></p></div>
<footer class="site-footer wrap"><span>Ryu Sakamoto / R.D.Sakamoto</span><a href="#top">${
    t.top
  } ↑</a><a href="https://github.com/Skmt3P/skmt3p">${
    ja ? '原本リポジトリ' : 'Source repository'
  } ↗</a><span>UTF-8 / ${locale.toUpperCase()} / portfolio</span></footer></div>
<script src="${prefix}static/portfolio.js?v=decision-10" defer></script></body></html>`
  await writeFile(`${dir}index.html`, html)
  if (!ja) {
    const notFound = html
      .replace('<title>Ryu Sakamoto', '<title>404 — Ryu Sakamoto')
      .replaceAll('href="./', 'href="/')
      .replaceAll('src="./', 'src="/')
      .replace(
        '<div class="terminal-body">',
        '<div class="path-error" role="status"><p>$ open requested-path</p><h2>404: Path not found.</h2><p>That address is not in this portfolio. Explore the files below, or <a href="/">return to the home path</a>.</p><p lang="ja">このアドレスは見つかりません。<a href="/ja/">日本語のポートフォリオへ戻る</a></p></div><div class="terminal-body">'
      )
    await writeFile(`${docs}404.html`, notFound)
  }
}
