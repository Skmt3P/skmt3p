import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { mdToPdf } = require('md-to-pdf')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const layerRoot = path.resolve(__dirname, '..')
const sourcePath = path.join(layerRoot, 'docs', 'ja', 'README.md')
const outputDir = path.join(layerRoot, 'dist', 'career-docs', 'ja')
const googleOutputDir = path.join(outputDir, 'google-apps-script')

const profile = {
  displayName: 'R.D.Sakamoto(Ryu Sakamoto)',
  furigana: '',
  birthDate: '',
  gender: '',
  address: '',
  phone: '',
  email: '',
  portfolio: 'https://skmt3p.com',
  github: 'https://github.com/Skmt3P',
  linkedin: 'https://linkedin.com/in/ryu-sakamoto-91957152/',
}

const pdfOptions = {
  pdf_options: {
    format: 'A4',
    printBackground: true,
    margin: {
      top: '12mm',
      right: '12mm',
      bottom: '12mm',
      left: '12mm',
    },
  },
  launch_options: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
}

const baseStyle = `
body {
  color: #111827;
  font-family: -apple-system, BlinkMacSystemFont, "Hiragino Sans", "Yu Gothic", "YuGothic", "Noto Sans JP", sans-serif;
  font-size: 11px;
  line-height: 1.55;
}
h1 {
  border-bottom: 2px solid #111827;
  font-size: 22px;
  letter-spacing: 0;
  margin: 0 0 12px;
  padding-bottom: 6px;
  text-align: center;
}
h2 {
  background: #f3f4f6;
  border-left: 4px solid #111827;
  font-size: 14px;
  margin: 18px 0 8px;
  padding: 5px 8px;
}
h3 {
  border-bottom: 1px solid #d1d5db;
  font-size: 12px;
  margin: 12px 0 6px;
  padding-bottom: 3px;
}
p {
  margin: 4px 0 8px;
}
ul {
  margin: 4px 0 8px 18px;
  padding: 0;
}
li {
  margin: 2px 0;
}
table {
  border-collapse: collapse;
  margin: 6px 0 10px;
  width: 100%;
}
th,
td {
  border: 1px solid #9ca3af;
  padding: 5px 6px;
  vertical-align: top;
}
th {
  background: #f9fafb;
  font-weight: 700;
  text-align: left;
  white-space: nowrap;
}
.note {
  color: #4b5563;
  font-size: 10px;
}
.page-break {
  break-before: page;
}
`

const toPlainText = (value) =>
  value
    .replace(/^---[\s\S]*?---\s*/, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`#>]/g, '')
    .replace(/[🎫👤💻👔🍀]/g, '')
    .replace(/\r\n/g, '\n')
    .trim()

const normalizeBlock = (value) =>
  toPlainText(value)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n')

const sectionBetween = (markdown, startHeading, endHeading) => {
  const start = markdown.indexOf(startHeading)
  if (start < 0) {
    return ''
  }
  const end = endHeading ? markdown.indexOf(endHeading, start + startHeading.length) : -1
  return markdown.slice(start, end < 0 ? undefined : end)
}

const parseFields = (block) => {
  const fields = new Map()
  const matches = block.matchAll(/####\s+(.+?)\n([\s\S]*?)(?=\n####\s+|\n-{5,}|\n###\s+|$)/g)
  for (const match of matches) {
    fields.set(normalizeBlock(match[1]), normalizeBlock(match[2]))
  }
  return fields
}

const parseJobs = (section, category) => {
  const matches = [...section.matchAll(/(?:^|\n)###\s+(.+?)\n([\s\S]*?)(?=\n###\s+|\n##\s+|$)/g)]
  return matches.map((match) => {
    const rawTitle = normalizeBlock(match[1])
    const [period = '', title = rawTitle] = rawTitle.split(/:\s+(.+)/)
    const fields = parseFields(match[2])
    return {
      category,
      period: period.trim(),
      title: title.trim(),
      position: fields.get('ポジション') ?? '',
      phase: fields.get('参画フェーズ') ?? '',
      description: fields.get('業務内容') ?? fields.get('内容') ?? '',
      tools:
        fields.get('使用技術・ツール') ??
        fields.get('使用技術・スキル') ??
        fields.get('使用技術') ??
        '',
    }
  })
}

const parsePeriodStart = (period) => {
  const match = period.match(/^(\d{4})(\d{2})?/)
  if (!match) {
    return 0
  }
  return Number(`${match[1]}${match[2] ?? '01'}`)
}

const formatPeriod = (period) => {
  const match = period.match(/^(\d{4})(\d{2})?(?:-(現在|\d{6}|\d{2}))?/)
  if (!match) {
    return period || '期間未記載'
  }
  const start = `${match[1]}年${match[2] ?? '01'}月`
  if (!match[3]) {
    return start
  }
  if (match[3] === '現在') {
    return `${start} - 現在`
  }
  if (match[3].length === 2) {
    return `${start} - ${match[1]}年${match[3]}月`
  }
  return `${start} - ${match[3].slice(0, 4)}年${match[3].slice(4, 6)}月`
}

const markdownTableRow = (cells) =>
  `| ${cells.map((cell) => String(cell).replace(/\n/g, '<br>').replace(/\|/g, '\\|')).join(' | ')} |`

const csvValue = (value) => {
  const text = String(value ?? '').replace(/\r\n/g, '\n')
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

const csvRows = (rows) => `${rows.map((row) => row.map(csvValue).join(',')).join('\n')}\n`

const todayJa = () => {
  const formatter = new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const parts = Object.fromEntries(formatter.formatToParts(new Date()).map((part) => [part.type, part.value]))
  return `${parts.year}年${parts.month}月${parts.day}日`
}

const toSheetJob = (job, index) => ({
  no: index + 1,
  category: job.category,
  period: formatPeriod(job.period),
  rawPeriod: job.period,
  title: job.title,
  position: job.position,
  phase: job.phase,
  description: job.description,
  tools: job.tools,
})

const collectData = async () => {
  const source = await fs.readFile(sourcePath, 'utf8')
  const about = sectionBetween(source, '## 👤 ABOUT ME', '## 💻 RESUME(ENGINEER)')
  const engineer = sectionBetween(source, '## 💻 RESUME(ENGINEER)', '## 👔 RESUME(OTHERS)')
  const others = sectionBetween(source, '## 👔 RESUME(OTHERS)', '## 🍀 CONTACT & LINKS')
  const contact = sectionBetween(source, '## 🍀 CONTACT & LINKS')

  const summary = normalizeBlock(about)
    .replace(/^ABOUT ME\n*/, '')
    .split('\n')
    .filter(Boolean)

  const jobs = [...parseJobs(engineer, 'エンジニア / PM'), ...parseJobs(others, 'その他')]
  const skills = [
    ...new Set(
      jobs
        .flatMap((job) => job.tools.split(/\n|,/))
        .map((skill) => skill.replace(/^[^:]+:\s*/, '').trim())
        .filter(Boolean),
    ),
  ]

  const links = [...contact.matchAll(/<a href="([^"]+)".*?>(.*?)<\/a>/g)].map((match) => ({
    label: match[2],
    url: match[1],
  }))

  return {
    generatedAt: todayJa(),
    profile,
    summary,
    jobs,
    skills,
    links,
  }
}

const buildRirekisho = ({ generatedAt, jobs, links }) => {
  const histories = jobs
    .filter((job) => ['TIS株式会社のSAP ERPコンサルタント', 'VR企業Webサイト・Webアプリケーション開発(リモートワーク)', 'VR企業プロジェクトマネジメント(リモートワーク)'].includes(job.title))
    .sort((a, b) => parsePeriodStart(a.period) - parsePeriodStart(b.period))

  const careerRows = [
    ['年', '月', '学歴・職歴'],
    ['---', '---', '---'],
    ['', '', '学歴'],
    ['', '', '既存Resumeに未記載のため、提出先に合わせて追記'],
    ['', '', '職歴'],
    ...histories.map((job) => [
      formatPeriod(job.period).split('年')[0],
      formatPeriod(job.period).match(/年(\d{2})月/)?.[1] ?? '',
      `${job.title} / ${job.position}`,
    ]),
    ['', '', '以上'],
  ]

  return `# 履歴書

提出日: ${generatedAt}

## 基本情報

${markdownTableRow(['項目', '内容'])}
${markdownTableRow(['---', '---'])}
${markdownTableRow(['ふりがな', profile.furigana || ''])}
${markdownTableRow(['氏名', profile.displayName])}
${markdownTableRow(['生年月日', profile.birthDate || ''])}
${markdownTableRow(['性別', profile.gender || ''])}
${markdownTableRow(['現住所', profile.address || ''])}
${markdownTableRow(['電話', profile.phone || ''])}
${markdownTableRow(['メール', profile.email || ''])}
${markdownTableRow(['ポートフォリオ', profile.portfolio])}
${markdownTableRow(['GitHub', profile.github])}
${markdownTableRow(['LinkedIn', profile.linkedin])}

## 学歴・職歴

${careerRows.map(markdownTableRow).join('\n')}

## 免許・資格

${markdownTableRow(['年', '月', '免許・資格'])}
${markdownTableRow(['---', '---', '---'])}
${markdownTableRow(['', '', 'SAP ERP 会計領域認定コンサルタント'])}

## 志望動機・自己PR・本人希望欄

Vue / Nuxt / TypeScriptを中心としたWebフロントエンド開発、開発組織マネジメント、プロジェクトマネジメント、AI活用を横断して価値を出せます。技術、プロダクト、事業、コミュニティの間に立ち、アイデアを実装可能な計画へ落とし込み、チームと一緒に前へ進めることを得意とします。

本人希望: 提出先に合わせて追記

## 連絡先・リンク

${links.map((link) => `- ${link.label}: ${link.url}`).join('\n')}

<p class="note">注: 個人情報・学歴など公開Resumeにない項目は空欄または追記欄として出力しています。</p>
`
}

const buildShokumuKeirekisho = ({ generatedAt, summary, jobs, skills }) => {
  const engineerJobs = jobs.filter((job) => job.category === 'エンジニア / PM')
  const otherJobs = jobs.filter((job) => job.category === 'その他')

  const jobBlock = (job) => `### ${formatPeriod(job.period)} ${job.title}

${markdownTableRow(['項目', '内容'])}
${markdownTableRow(['---', '---'])}
${markdownTableRow(['ポジション', job.position])}
${markdownTableRow(['参画フェーズ', job.phase || '-'])}
${markdownTableRow(['業務内容', job.description])}
${markdownTableRow(['使用技術・ツール', job.tools || '-'])}
`

  return `# 職務経歴書

作成日: ${generatedAt}  
氏名: ${profile.displayName}

## 職務要約

${summary.join('\n\n')}

## 活かせる経験・強み

- Vue / Nuxt / TypeScriptを軸にしたWebフロントエンド開発
- アーキテクチャ設計、コーディングガイドライン策定、コードレビュー、開発プロセス改善
- Web開発組織のマネジメント、メンバー支援、チーム立ち上げ
- 企画営業、要件整理、進行管理、納品までを横断するプロジェクトマネジメント
- ChatGPT / Codex / ClaudeなどのAIを活用した企画、実装支援、ドキュメント化
- 技術、プロダクト、事業、コミュニティをつなぐコミュニケーションと実行推進

## 技術・ツール

${skills.map((skill) => `- ${skill}`).join('\n')}

## 職務経歴

${engineerJobs.map(jobBlock).join('\n')}

<div class="page-break"></div>

## その他活動

${otherJobs.map(jobBlock).join('\n')}

## 自己PR

SAP ERPコンサルタントとして要件定義から運用まで経験した後、フロントエンドエンジニアへ転身し、Vue.js / Nuxt.js / TypeScriptを中心にWebサイト・Webアプリケーション開発を担当してきました。近年はWebエンジニアマネージャーおよびプロジェクトマネジメント部門責任者として、技術判断、組織運営、事業計画、R&D、AI活用を含むプロジェクト推進に携わっています。

技術だけ、管理だけに閉じず、目的を実装可能な形へ分解し、関係者が動ける状態を作ることを重視しています。
`
}

const wrapMarkdown = (title, body) => `---
pdf_options:
  format: A4
  margin: 12mm
  printBackground: true
---

<style>
${baseStyle}
</style>

${body}
`

const buildHtml = (title, markdown) => {
  const content = markdown
    .replace(/^---[\s\S]*?---\s*/, '')
    .replace(/^# (.*)$/gm, '<h1>$1</h1>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^\| (.*) \|$/gm, (_, row) => `<tr>${row.split(' | ').map((cell) => `<td>${cell}</td>`).join('')}</tr>`)
    .replace(/(?:<tr>[\s\S]*?<\/tr>\n?)+/g, (table) => `<table>${table}</table>`)
    .replace(/^- (.*)$/gm, '<li>$1</li>')
    .replace(/(?:<li>[\s\S]*?<\/li>\n?)+/g, (list) => `<ul>${list}</ul>`)
    .split(/\n{2,}/)
    .map((block) => {
      if (/^<(h1|h2|h3|table|ul|div|p)/.test(block.trim())) {
        return block
      }
      return `<p>${block.replace(/\n/g, '<br>')}</p>`
    })
    .join('\n')

  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>${baseStyle}</style>
</head>
<body>
${content}
</body>
</html>
`
}

const writeDocument = async (basename, title, markdown) => {
  const markdownPath = path.join(outputDir, `${basename}.md`)
  const htmlPath = path.join(outputDir, `${basename}.html`)
  const pdfPath = path.join(outputDir, `${basename}.pdf`)
  const wrapped = wrapMarkdown(title, markdown)

  await fs.writeFile(markdownPath, wrapped)
  await fs.writeFile(htmlPath, buildHtml(title, wrapped))
  await mdToPdf({ content: wrapped }, { ...pdfOptions, dest: pdfPath })

  return { markdownPath, htmlPath, pdfPath }
}

const buildCareerProfile = (data) => ({
  generatedAt: data.generatedAt,
  source: path.relative(layerRoot, sourcePath),
  profile: data.profile,
  summary: data.summary,
  strengths: [
    'Vue / Nuxt / TypeScriptを軸にしたWebフロントエンド開発',
    'アーキテクチャ設計、コーディングガイドライン策定、コードレビュー、開発プロセス改善',
    'Web開発組織のマネジメント、メンバー支援、チーム立ち上げ',
    '企画営業、要件整理、進行管理、納品までを横断するプロジェクトマネジメント',
    'ChatGPT / Codex / ClaudeなどのAIを活用した企画、実装支援、ドキュメント化',
    '技術、プロダクト、事業、コミュニティをつなぐコミュニケーションと実行推進',
  ],
  links: data.links,
  jobs: data.jobs.map(toSheetJob),
  skills: data.skills.map((skill, index) => ({
    no: index + 1,
    skill,
  })),
  formDraft: {
    note: '公開Resumeにない個人情報・学歴は空欄のままにしています。送信・共有前に必ず人間が確認してください。',
    desiredConditions: '',
    applicantMemo: '',
  },
})

const buildCareerSheetScript = (careerProfile) => `const CAREER_PROFILE = ${JSON.stringify(careerProfile, null, 2)};

function createCareerSheet() {
  const spreadsheet = SpreadsheetApp.create('職務経歴管理 - ' + CAREER_PROFILE.profile.displayName);
  createProfileSheet_(spreadsheet);
  createCareerHistorySheet_(spreadsheet);
  createSkillsSheet_(spreadsheet);
  createApplicationTrackerSheet_(spreadsheet);
  createAtlasPromptSheet_(spreadsheet);
  spreadsheet.getSheets()[0].activate();
  Logger.log('Created spreadsheet: ' + spreadsheet.getUrl());
}

function createProfileSheet_(spreadsheet) {
  const sheet = prepareSheet_(spreadsheet, 'プロフィール');
  const rows = [
    ['項目', '内容'],
    ['作成日', CAREER_PROFILE.generatedAt],
    ['氏名', CAREER_PROFILE.profile.displayName],
    ['ふりがな', CAREER_PROFILE.profile.furigana],
    ['生年月日', CAREER_PROFILE.profile.birthDate],
    ['性別', CAREER_PROFILE.profile.gender],
    ['現住所', CAREER_PROFILE.profile.address],
    ['電話', CAREER_PROFILE.profile.phone],
    ['メール', CAREER_PROFILE.profile.email],
    ['ポートフォリオ', CAREER_PROFILE.profile.portfolio],
    ['GitHub', CAREER_PROFILE.profile.github],
    ['LinkedIn', CAREER_PROFILE.profile.linkedin],
    ['本人希望', CAREER_PROFILE.formDraft.desiredConditions],
    ['応募メモ', CAREER_PROFILE.formDraft.applicantMemo],
    ['注意', CAREER_PROFILE.formDraft.note],
    ['職務要約', CAREER_PROFILE.summary.join('\\n\\n')],
  ];
  writeTable_(sheet, rows);
  sheet.setColumnWidths(1, 1, 160);
  sheet.setColumnWidths(2, 1, 640);
  sheet.getRange('B16').setWrap(true);
}

function createCareerHistorySheet_(spreadsheet) {
  const sheet = prepareSheet_(spreadsheet, '職務経歴');
  const rows = [
    ['No', '区分', '期間', '案件・活動', 'ポジション', '参画フェーズ', '業務内容', '使用技術・ツール'],
    ...CAREER_PROFILE.jobs.map((job) => [
      job.no,
      job.category,
      job.period,
      job.title,
      job.position,
      job.phase,
      job.description,
      job.tools,
    ]),
  ];
  writeTable_(sheet, rows);
  sheet.setFrozenRows(1);
  sheet.setColumnWidths(1, 1, 48);
  sheet.setColumnWidths(2, 3, 140);
  sheet.setColumnWidths(5, 2, 180);
  sheet.setColumnWidths(7, 2, 420);
  sheet.getDataRange().setWrap(true);
}

function createSkillsSheet_(spreadsheet) {
  const sheet = prepareSheet_(spreadsheet, 'スキル');
  const rows = [
    ['No', 'スキル・ツール', '分類', '補足'],
    ...CAREER_PROFILE.skills.map((skill) => [skill.no, skill.skill, '', '']),
  ];
  writeTable_(sheet, rows);
  sheet.setFrozenRows(1);
  sheet.setColumnWidths(1, 1, 48);
  sheet.setColumnWidths(2, 1, 240);
  sheet.setColumnWidths(3, 2, 180);
}

function createApplicationTrackerSheet_(spreadsheet) {
  const sheet = prepareSheet_(spreadsheet, '応募管理');
  const rows = [
    ['応募先', '職種', '応募日', 'ステータス', '提出書類', '次アクション', 'メモ'],
    ['', '', '', '未着手', '履歴書 / 職務経歴書', '', ''],
  ];
  writeTable_(sheet, rows);
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['未着手', '準備中', '応募済', '面談中', '保留', '辞退', '完了'], true)
    .build();
  sheet.getRange('D2:D200').setDataValidation(statusRule);
  sheet.setFrozenRows(1);
  sheet.setColumnWidths(1, 7, 160);
}

function createAtlasPromptSheet_(spreadsheet) {
  const sheet = prepareSheet_(spreadsheet, 'Atlas用プロンプト');
  const rows = [
    ['用途', 'プロンプト'],
    ['シート作成確認', 'このスプレッドシートのプロフィール、職務経歴、スキル、応募管理を確認し、応募先に合わせて不足情報だけ質問してください。共有設定や送信は変更しないでください。'],
    ['応募先向け要約', '応募先の求人票を読み、職務経歴シートの内容から一致度の高い経験を抽出して、職務経歴書の自己PR案を3案作ってください。'],
    ['フォーム作成補助', 'create-career-form.gs の項目構成を確認し、Googleフォーム作成前に公開範囲と必須項目の妥当性を確認してください。'],
  ];
  writeTable_(sheet, rows);
  sheet.setColumnWidths(1, 1, 180);
  sheet.setColumnWidths(2, 1, 760);
  sheet.getDataRange().setWrap(true);
}

function prepareSheet_(spreadsheet, name) {
  const existing = spreadsheet.getSheetByName(name);
  if (existing) {
    existing.clear();
    return existing;
  }
  const firstSheet = spreadsheet.getSheets()[0];
  const canReuseFirstSheet =
    spreadsheet.getSheets().length === 1 &&
    firstSheet.getName() === 'Sheet1' &&
    firstSheet.getLastRow() === 0 &&
    firstSheet.getLastColumn() === 0;
  const sheet = canReuseFirstSheet ? firstSheet.setName(name) : spreadsheet.insertSheet(name);
  sheet.clear();
  return sheet;
}

function writeTable_(sheet, rows) {
  sheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
  const header = sheet.getRange(1, 1, 1, rows[0].length);
  header.setFontWeight('bold').setBackground('#f3f4f6');
  sheet.getDataRange().setVerticalAlignment('top');
  sheet.autoResizeRows(1, rows.length);
}
`

const buildCareerFormScript = (careerProfile) => `const CAREER_PROFILE = ${JSON.stringify(careerProfile, null, 2)};

function createCareerForm() {
  const form = FormApp.create('職務経歴入力フォーム - ' + CAREER_PROFILE.profile.displayName);
  form.setDescription('公開Resumeをもとにした応募用情報整理フォームです。公開・送信前に必ず内容を確認してください。');
  form.setCollectEmail(false);
  form.addSectionHeaderItem().setTitle('基本情報');
  form.addTextItem().setTitle('氏名').setRequired(true).setHelpText(CAREER_PROFILE.profile.displayName);
  form.addTextItem().setTitle('ふりがな');
  form.addTextItem().setTitle('メール');
  form.addTextItem().setTitle('電話');
  form.addParagraphTextItem().setTitle('現住所');
  form.addTextItem().setTitle('ポートフォリオURL').setHelpText(CAREER_PROFILE.profile.portfolio);
  form.addTextItem().setTitle('GitHub URL').setHelpText(CAREER_PROFILE.profile.github);
  form.addTextItem().setTitle('LinkedIn URL').setHelpText(CAREER_PROFILE.profile.linkedin);

  form.addSectionHeaderItem().setTitle('職務要約・自己PR');
  form.addParagraphTextItem().setTitle('職務要約').setHelpText(CAREER_PROFILE.summary.join('\\n\\n'));
  form.addCheckboxItem()
    .setTitle('活かせる経験・強み')
    .setChoiceValues(CAREER_PROFILE.strengths);
  form.addParagraphTextItem().setTitle('応募先向け自己PR');
  form.addParagraphTextItem().setTitle('本人希望・条件');

  form.addSectionHeaderItem().setTitle('職務経歴');
  form.addCheckboxItem()
    .setTitle('提出先に強調したい職務経歴')
    .setChoiceValues(CAREER_PROFILE.jobs.map((job) => job.period + ' ' + job.title + ' / ' + job.position));
  form.addParagraphTextItem().setTitle('職務経歴の補足');

  form.addSectionHeaderItem().setTitle('スキル');
  form.addCheckboxItem()
    .setTitle('強調したいスキル')
    .setChoiceValues(CAREER_PROFILE.skills.map((skill) => skill.skill));
  form.addParagraphTextItem().setTitle('スキルの補足');

  form.addSectionHeaderItem().setTitle('応募管理');
  form.addTextItem().setTitle('応募先');
  form.addTextItem().setTitle('職種');
  form.addDateItem().setTitle('応募予定日');
  form.addParagraphTextItem().setTitle('メモ');
  Logger.log('Created form edit URL: ' + form.getEditUrl());
  Logger.log('Created form preview URL: ' + form.getPublishedUrl());
}
`

const buildGoogleReadme = () => `# Google Sheets / Forms automation

このディレクトリは、履歴書・職務経歴書の内容をGoogle Sheets / Google Formsへ流し込むための補助ファイルです。

## Files

- \`create-career-sheet.gs\`: 職務経歴管理スプレッドシートを作成するGoogle Apps Script
- \`create-career-form.gs\`: 応募用Googleフォームを作成するGoogle Apps Script
- \`atlas-prompt.md\`: Atlas Agentへ渡すプロンプト例

## Atlasで試す手順

1. Google Driveで新しいGoogle Apps Scriptプロジェクトを開く
2. \`create-career-sheet.gs\` または \`create-career-form.gs\` の内容を貼り付ける
3. 実行関数として \`createCareerSheet\` または \`createCareerForm\` を選ぶ
4. 実行前に、Atlasへ「共有設定や送信は変更しないで」と明示する
5. 作成されたURLを確認し、公開・共有・送信は人間が確認してから行う

## 注意

公開Resumeにない個人情報・学歴は空欄にしています。Apps Script実行後、提出先に合わせて必ず追記・確認してください。
`

const buildAtlasPrompt = () => `# Atlas prompt examples

## Google Sheetsを作る

\`\`\`text
このリポジトリの dist/career-docs/ja/google-apps-script/create-career-sheet.gs を使って、
Google Apps Scriptで職務経歴管理スプレッドシートを作ってください。
実行前に作成されるシート構成を確認してください。
共有設定、公開設定、外部送信は変更しないでください。
\`\`\`

## Google Formsを作る

\`\`\`text
このリポジトリの dist/career-docs/ja/google-apps-script/create-career-form.gs を使って、
応募用の職務経歴入力フォームを作ってください。
実行前にフォーム項目を確認してください。
フォームの公開、回答受付、共有設定は変更しないでください。
\`\`\`

## 応募先向けに内容を調整する

\`\`\`text
求人票の内容を読み、職務経歴シートの経験・スキルから関連度が高いものを抽出してください。
履歴書・職務経歴書の原文を直接上書きせず、提案欄に追記案だけ作ってください。
\`\`\`
`

const writeStructuredOutputs = async (data) => {
  await fs.mkdir(googleOutputDir, { recursive: true })
  const careerProfile = buildCareerProfile(data)
  const historyRows = [
    ['No', '区分', '期間', '元期間', '案件・活動', 'ポジション', '参画フェーズ', '業務内容', '使用技術・ツール'],
    ...careerProfile.jobs.map((job) => [
      job.no,
      job.category,
      job.period,
      job.rawPeriod,
      job.title,
      job.position,
      job.phase,
      job.description,
      job.tools,
    ]),
  ]
  const skillRows = [
    ['No', 'スキル・ツール'],
    ...careerProfile.skills.map((skill) => [skill.no, skill.skill]),
  ]
  const profileRows = [
    ['項目', '内容'],
    ['作成日', careerProfile.generatedAt],
    ['氏名', careerProfile.profile.displayName],
    ['ふりがな', careerProfile.profile.furigana],
    ['生年月日', careerProfile.profile.birthDate],
    ['性別', careerProfile.profile.gender],
    ['現住所', careerProfile.profile.address],
    ['電話', careerProfile.profile.phone],
    ['メール', careerProfile.profile.email],
    ['ポートフォリオ', careerProfile.profile.portfolio],
    ['GitHub', careerProfile.profile.github],
    ['LinkedIn', careerProfile.profile.linkedin],
    ['職務要約', careerProfile.summary.join('\n\n')],
  ]

  const outputs = [
    [path.join(outputDir, 'career-profile.json'), `${JSON.stringify(careerProfile, null, 2)}\n`],
    [path.join(outputDir, 'career-history.csv'), csvRows(historyRows)],
    [path.join(outputDir, 'skills.csv'), csvRows(skillRows)],
    [path.join(outputDir, 'profile.csv'), csvRows(profileRows)],
    [path.join(googleOutputDir, 'create-career-sheet.gs'), buildCareerSheetScript(careerProfile)],
    [path.join(googleOutputDir, 'create-career-form.gs'), buildCareerFormScript(careerProfile)],
    [path.join(googleOutputDir, 'README.md'), buildGoogleReadme()],
    [path.join(googleOutputDir, 'atlas-prompt.md'), buildAtlasPrompt()],
  ]

  for (const [filePath, content] of outputs) {
    await fs.writeFile(filePath, content)
  }

  return outputs.map(([filePath]) => filePath)
}

const main = async () => {
  await fs.mkdir(outputDir, { recursive: true })
  const data = await collectData()
  const outputs = [
    await writeDocument('rirekisho', '履歴書', buildRirekisho(data)),
    await writeDocument('shokumu-keirekisho', '職務経歴書', buildShokumuKeirekisho(data)),
  ]
  const structuredOutputs = await writeStructuredOutputs(data)

  console.log('日本向け履歴書・職務経歴書を生成しました。')
  for (const output of outputs) {
    console.log(`- ${path.relative(layerRoot, output.markdownPath)}`)
    console.log(`- ${path.relative(layerRoot, output.htmlPath)}`)
    console.log(`- ${path.relative(layerRoot, output.pdfPath)}`)
  }
  console.log('Google Sheets / Forms連携用ファイルを生成しました。')
  for (const output of structuredOutputs) {
    console.log(`- ${path.relative(layerRoot, output)}`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
