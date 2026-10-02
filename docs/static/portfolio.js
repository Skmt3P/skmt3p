let currentPath = '~'
// Keep deep links into the résumé usable even when its disclosure is closed.
function revealTarget(id) {
  const target = document.getElementById(id)
  if (!target) return null
  const disclosure = target.closest('details')
  if (disclosure) disclosure.open = true
  return target
}
function openHash() {
  let id
  try {
    id = decodeURIComponent(location.hash.slice(1))
  } catch {
    return
  }
  if (!id) return
  const target = revealTarget(id)
  if (target) target.scrollIntoView()
}
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = revealTarget(link.hash.slice(1))
    if (!target) return
    event.preventDefault()
    target.setAttribute('tabindex', '-1')
    target.focus({ preventScroll: true })
    target.scrollIntoView({
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    })
    history.pushState(null, '', link.hash)
  })
})
openHash()
addEventListener('hashchange', openHash)

// The terminal is a navigation metaphor, never a shell or a remote request.
const japanese = document.documentElement.lang === 'ja'
const commandForm = document.querySelector('#terminal-command')
const commandInput = document.querySelector('#command-input')
const commandResult = document.querySelector('#command-result')
const commandHistory = []
let historyIndex = 0
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')
const motionButton = document.querySelector('.motion-toggle')
let paused = reducedMotion.matches
let frame = 0
let visible = true
let phase = 0
let lastFrame = 0
let bridgeStage = 1
function setMotion(value) {
  paused = value
  document.documentElement.classList.toggle('motion-paused', paused)
  motionButton?.setAttribute('aria-pressed', String(paused))
  if (motionButton)
    motionButton.textContent = japanese
      ? paused
        ? '動きを再開'
        : '動きを止める'
      : paused
      ? 'Resume motion'
      : 'Pause motion'
  cancelAnimationFrame(frame)
  drawBridge()
}
if (motionButton) {
  motionButton.hidden = false
  motionButton.addEventListener('click', () => setMotion(!paused))
}
reducedMotion.addEventListener('change', (event) => setMotion(event.matches))
if (commandForm) {
  commandInput.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
    event.preventDefault()
    historyIndex = Math.max(
      0,
      Math.min(
        commandHistory.length,
        historyIndex + (event.key === 'ArrowUp' ? -1 : 1)
      )
    )
    commandInput.value = commandHistory[historyIndex] || ''
  })
  commandForm.hidden = false
  commandForm.addEventListener('submit', (event) => {
    event.preventDefault()
    const command = commandInput.value
      .trim()
      .toLowerCase()
      .replace(/^\.\//, '')
      .replace(/^(cat|cd|open) /, '')
    const destinations = {
      work: 'work',
      trace: 'trace',
      'trace --from=question --to=product': 'trace',
      about: 'experience',
      experience: 'experience',
      contact: 'contact',
      home: 'top',
      whoami: 'top',
      '..': 'top',
      connect: 'contact',
    }
    if (command) commandHistory.push(command)
    historyIndex = commandHistory.length
    if (command === 'pwd') {
      commandResult.textContent =
        '/portfolio/' + (currentPath === '~' ? '' : currentPath)
    } else if (command === 'ls') {
      commandResult.textContent = 'whoami / work / experience / connect'
    } else if (command === 'help') {
      commandResult.textContent = japanese
        ? 'work: 作品 / trace: 判断記録 / about: 経歴 / contact: 連絡先 / home: 最初へ / ls: 一覧 / pwd: 現在地 / clear: 消去 / ↑↓: 入力履歴'
        : 'work: products / trace: decisions / about: experience / contact: links / home: top / ls: list / pwd: location / clear: clear output / ↑↓: history'
    } else if (command === 'clear') {
      commandResult.textContent = ''
    } else if (Object.hasOwn(destinations, command)) {
      const target = revealTarget(destinations[command])
      target.setAttribute('tabindex', '-1')
      target.focus({ preventScroll: true })
      target.scrollIntoView({ behavior: paused ? 'instant' : 'smooth' })
      history.pushState(null, '', '#' + destinations[command])
      commandResult.textContent =
        '$ ' + command + ' → /' + destinations[command]
    } else {
      commandResult.textContent = japanese
        ? 'そのコマンドはありません。help で使えるコマンドを確認できます。'
        : 'Unknown command. Type help to see available commands.'
    }
    commandInput.value = ''
  })
}

// The bridge is a working drawing: intent, structure and a live connection.
const canvas = document.querySelector('#signal-canvas')
const ctx = canvas?.getContext('2d')
let bridgeView = 'space'
let construction = 1
let targetConstruction = 1
const views = {
  space: { angle: -0.48, elevation: 0.34, flatten: 1, baseline: 0.65 },
  plan: { angle: 0, elevation: 1.25, flatten: 0, baseline: 0.49 },
  side: { angle: 0, elevation: 0.02, flatten: 1, baseline: 0.65 },
}
let camera = { ...views.space }
function projectPoint(x, y, z, w, h) {
  const angle = camera.angle
  const rx = x * Math.cos(angle) - z * Math.sin(angle)
  const rz = x * Math.sin(angle) + z * Math.cos(angle)
  const scale = Math.min(w / 8.8, h / 4.9)
  const { flatten, baseline } = camera
  return [
    w / 2 + rx * scale,
    h * baseline - y * scale * flatten + rz * scale * camera.elevation,
  ]
}
function drawBridge(now = 0) {
  if (!ctx || !canvas) return
  const w = canvas.clientWidth || 500
  const h = canvas.clientHeight || 310
  const dpr = Math.min(devicePixelRatio, 2)
  if (
    canvas.width !== Math.round(w * dpr) ||
    canvas.height !== Math.round(h * dpr)
  ) {
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  if (now - lastFrame > 32 || !now) {
    lastFrame = now
    const moving = !paused && visible && !document.hidden
    if (moving) phase += 0.028
    construction += (targetConstruction - construction) * (paused ? 1 : 0.13)
    for (const key of ['angle', 'elevation', 'flatten', 'baseline'])
      camera[key] +=
        (views[bridgeView][key] - camera[key]) * (paused ? 1 : 0.13)
    ctx.clearRect(0, 0, w, h)
    ctx.textAlign = 'center'
    ctx.font = '9px Menlo, monospace'
    const projected = (x, y, z) => projectPoint(x, y, z, w, h)
    const line = (from, to, color, dash = []) => {
      ctx.beginPath()
      ctx.strokeStyle = color
      ctx.lineWidth = 0.7
      ctx.setLineDash(dash)
      ctx.moveTo(...projected(...from))
      ctx.lineTo(...projected(...to))
      ctx.stroke()
      ctx.setLineDash([])
    }
    const progress = Math.min(1, construction)
    const point = (x, y, z, glyph, color, seed = 0) => {
      // The same points assemble from a field of possibilities into one structure.
      const scatter = 1 - progress
      const [px, py] = projected(
        x + Math.sin(seed * 2.3) * scatter * 0.5,
        y + Math.cos(seed * 1.7) * scatter * 0.65,
        z + Math.sin(seed * 0.83) * scatter * 0.65
      )
      ctx.fillStyle = color
      ctx.fillText(scatter > 0.65 ? '·' : glyph, px, py)
    }
    // Coordinate field stays fixed: form changes against a readable reference.
    for (let x = -3.8; x <= 3.8; x += 0.4) {
      for (let z = -1.3; z <= 1.7; z += 0.4) {
        const [px, py] = projected(x, -0.28, z)
        ctx.fillStyle = '#294c36'
        ctx.fillRect(px, py, 1, 1)
      }
    }
    let seed = 0
    for (const z of [-0.65, 0.65]) {
      for (let x = -3.5; x <= 3.5; x += 0.13) {
        point(x, 0.15, z, '═', '#89dba2', seed++)
        const cable = 0.55 + 1.5 * Math.pow(Math.abs(x) / 2.25, 2)
        if (Math.abs(x) <= 2.3) point(x, cable, z, '+', '#c9f5d6', seed++)
      }
      for (const x of [-2.25, 2.25]) {
        for (let y = 0; y < 2.35; y += 0.105)
          point(x, y, z, '║', '#94efb0', seed++)
      }
      for (let x = -2; x <= 2; x += 0.4) {
        const top = 0.55 + 1.5 * Math.pow(Math.abs(x) / 2.25, 2)
        for (let y = 0.32; y < top; y += 0.15)
          point(x, y, z, '│', '#618c6e', seed++)
      }
    }
    for (let x = -3.5; x < 3.5; x += 0.28) {
      for (let z = -0.55; z < 0.65; z += 0.24)
        point(x, 0.13, z, '·', '#759c80', seed++)
    }
    // Cross-members make the plan view a connected deck, not two separate elevations.
    if (construction > 0.1) {
      ctx.globalAlpha = progress
      for (let x = -3.45; x <= 3.45; x += 0.48) {
        line([x, 0.13, -0.65], [x, 0.13, 0.65], '#456d51')
      }
      ctx.globalAlpha = 1
    }
    if (construction > 0.1) {
      ctx.globalAlpha = progress
      line([-3.5, -0.42, 0.8], [3.5, -0.42, 0.8], '#72957d', [3, 4])
      for (const x of [-3.5, 3.5])
        line([x, -0.55, 0.8], [x, -0.28, 0.8], '#a7c7ad')
      ctx.globalAlpha = 1
    }
    if (construction > 1) {
      ctx.globalAlpha = Math.min(1, construction - 1)
      for (let i = 0; i < 12; i++) {
        const x = ((phase * 0.8 + i * 0.61) % 7) - 3.5
        const z = ((i % 3) - 1) * 0.32
        point(x, 0.36, z, ['>', '•', '>'][i % 3], '#f4d18a')
        line([x - 0.17, 0.25, z], [x, 0.25, z], '#ad874c')
      }
      ctx.globalAlpha = 1
    }
    // Endpoints describe the metaphor; these are not fabricated measurements.
    ctx.font = '10px Menlo, monospace'
    ctx.fillStyle = '#b9d2c0'
    ctx.textAlign = 'left'
    ctx.fillText('PEOPLE', 20, h - 15)
    ctx.textAlign = 'right'
    ctx.fillText('TECHNOLOGY', w - 20, h - 15)
    ctx.strokeStyle = '#345441'
    ctx.beginPath()
    ctx.moveTo(72, h - 19)
    ctx.lineTo(w - 98, h - 19)
    ctx.stroke()
    canvas.dataset.ready = 'true'
    canvas.dataset.stage = String(bridgeStage)
    canvas.dataset.view = bridgeView
  }
  const unsettled =
    Math.abs(targetConstruction - construction) > 0.002 ||
    Object.keys(camera).some(
      (key) => Math.abs(views[bridgeView][key] - camera[key]) > 0.002
    )
  if (
    !paused &&
    visible &&
    !document.hidden &&
    (bridgeStage === 2 || unsettled)
  )
    frame = requestAnimationFrame(drawBridge)
}
if (canvas && ctx) {
  new ResizeObserver(() => {
    cancelAnimationFrame(frame)
    drawBridge()
  }).observe(canvas)
  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting
    cancelAnimationFrame(frame)
    drawBridge()
  }).observe(canvas)
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(frame)
    drawBridge()
  })
}
setMotion(paused)
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (!paused) entry.target.classList.add('reveal-ready')
        revealObserver.unobserve(entry.target)
      }
    })
  },
  { threshold: 0.12 }
)
document
  .querySelectorAll('.project,.expertise article,.contact-links')
  .forEach((el) => revealObserver.observe(el))
// Derive the current section from the reading line, including deep résumé links.
// Intersection entries can arrive after a jump and otherwise leave stale navigation.
function syncCurrentSection() {
  const readingLine =
    (document.querySelector('.site-header')?.getBoundingClientRect().bottom ||
      0) + 24
  const sections = [
    ...document.querySelectorAll('#home,#work,#experience,#contact'),
  ]
  // The last anchor cannot reach the reading line once scrolling hits the
  // document end. Select the visible final section instead of its predecessor.
  const atDocumentEnd =
    window.scrollY + window.innerHeight >=
    document.documentElement.scrollHeight - 16
  const finalSection = sections.at(-1)
  const active =
    atDocumentEnd &&
    finalSection?.getBoundingClientRect().top < window.innerHeight
      ? finalSection
      : sections
          .filter(
            (section) => section.getBoundingClientRect().top <= readingLine
          )
          .at(-1) || sections[0]
  if (!active) return
  currentPath = active.id === 'home' ? '~' : active.id
  const label = document.querySelector('label[for="command-input"]')
  if (label) label.textContent = 'visitor@skmt3p:' + currentPath + ' $'
  document
    .querySelectorAll('.site-header nav a[href^="#"],.file-tree > a[href^="#"]')
    .forEach((link) => {
      if (link.hash === (active.id === 'home' ? '#top' : '#' + active.id))
        link.setAttribute('aria-current', 'location')
      else link.removeAttribute('aria-current')
    })
}
let sectionFrame = 0
function scheduleSectionSync() {
  if (sectionFrame) return
  sectionFrame = requestAnimationFrame(() => {
    sectionFrame = 0
    syncCurrentSection()
  })
}
addEventListener('scroll', scheduleSectionSync, { passive: true })
addEventListener('resize', scheduleSectionSync)
document
  .querySelector('.resume')
  ?.addEventListener('toggle', scheduleSectionSync)
syncCurrentSection()

// Progressive enhancement: the complete decision record remains readable without JS.
const trace = document.querySelector('.decision-trace')
if (trace) {
  trace.classList.add('trace-ready')
  const projectButtons = [...trace.querySelectorAll('[data-trace-project]')]
  trace.querySelector('.trace-projects').hidden = false
  const cases = [...trace.querySelectorAll('[data-trace-case]')]
  cases.forEach((item, caseIndex) => {
    item.hidden = caseIndex !== 0
    const steps = [...item.querySelectorAll('.trace-step')]
    const output = item.querySelector('.trace-output')
    output.hidden = false
    function selectStep(index) {
      steps.forEach((step, i) => {
        step.classList.toggle('is-selected', i === index)
        step
          .querySelector('button')
          .setAttribute('aria-pressed', String(i === index))
      })
      item.querySelector('.trace-stage').textContent =
        steps[index].querySelector('h4').textContent
      item.querySelector('.trace-copy').textContent =
        steps[index].querySelector('p').textContent
      item.querySelector('.trace-position').textContent = `0${index + 1} / 03`
      item.dataset.activeStep = index
      const screenshot = item.querySelector('[data-trace-image]')
      screenshot.src = screenshot.dataset.traceImage + index + '.webp?v=iter6'
      const views =
        item.dataset.traceCase === 'Kakiba'
          ? japanese
            ? ['書く画面', '同じ文章を読み返す画面', '段落の読み尺で次の段落へ']
            : [
                'Writing view',
                'The same text in reading view',
                'Move the reading ruler to the next paragraph',
              ]
          : japanese
          ? [
              'カフェの場面・英語',
              '発話と比較を隠して思い出す',
              '英語の発話を再表示して確認',
            ]
          : [
              'Cafe scene in English',
              'Recall with the phrase and comparison hidden',
              'Reveal the English phrase to check',
            ]
      screenshot.alt = item.dataset.traceCase + ' — ' + views[index]
    }
    steps.forEach((step, i) => {
      const heading = step.querySelector('h4')
      const button = document.createElement('button')
      button.type = 'button'
      while (heading.firstChild) button.append(heading.firstChild)
      heading.append(button)
      button.addEventListener('click', () => selectStep(i))
    })
    selectStep(0)
  })
  projectButtons.forEach((button) =>
    button.addEventListener('click', () => {
      projectButtons.forEach((other) =>
        other.setAttribute('aria-pressed', String(other === button))
      )
      cases.forEach((item) => {
        item.hidden = item.dataset.traceCase !== button.dataset.traceProject
      })
    })
  )
}

const bridgeControls = document.querySelector('.bridge-controls')
if (bridgeControls) {
  bridgeControls.hidden = false
  const caption = document.querySelector('.signal-visual figcaption')
  caption.setAttribute('aria-live', 'polite')
  bridgeControls.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => {
      bridgeStage = Number(button.dataset.bridgeStage)
      targetConstruction = bridgeStage
      bridgeControls
        .querySelectorAll('button')
        .forEach((other) =>
          other.setAttribute('aria-pressed', String(other === button))
        )
      caption.textContent = button.dataset.description
      const proof = document.querySelector('.hero-proof')
      const sourceStep = document.querySelectorAll(
        '[data-trace-case="Kakiba"] .trace-step'
      )[bridgeStage]
      if (proof && sourceStep) {
        proof.querySelector('.proof-label').textContent = sourceStep
          .querySelector('h4')
          .textContent.replace(/^0[123]/, '')
          .trim()
        proof.querySelector('.proof-copy').textContent =
          sourceStep.querySelector('p').textContent
        proof.querySelector('.proof-image').src =
          proof.querySelector('.proof-image').src.replace(/kakiba-hero-\d\.png.*$/, `kakiba-hero-${bridgeStage}.png?v=decision10`)
      }

      const example = document.querySelector('.bridge-example code')
      if (example)
        example.textContent =
          ['THINK', 'BUILD', 'CONNECT'][bridgeStage] +
          ' → trace/0' +
          (bridgeStage + 1) +
          ' ↘'
      cancelAnimationFrame(frame)
      drawBridge()
    })
  })
}

// Inspect the actual capture inside the same terminal, with native modal focus handling.
if (trace) {
  const dialog = document.createElement('dialog')
  dialog.className = 'trace-image-dialog'
  const bar = document.createElement('div')
  bar.className = 'trace-image-bar'
  const title = document.createElement('span')
  title.id = 'trace-image-title'
  title.textContent = japanese
    ? '実画面を確認 / 横にスクロールして詳細を見る'
    : 'Inspect capture / scroll sideways for detail'
  dialog.setAttribute('aria-labelledby', title.id)
  const close = document.createElement('button')
  close.type = 'button'
  close.textContent = japanese ? '閉じる [Esc]' : 'Close [Esc]'
  close.addEventListener('click', () => dialog.close())
  bar.append(title, close)
  const viewport = document.createElement('div')
  viewport.className = 'trace-image-viewport'
  viewport.tabIndex = 0
  viewport.setAttribute('role', 'region')
  viewport.setAttribute(
    'aria-label',
    japanese ? '拡大画像' : 'Enlarged capture'
  )
  const fullImage = document.createElement('img')
  viewport.append(fullImage)
  dialog.append(bar, viewport)
  document.body.append(dialog)
  trace.querySelectorAll('[data-trace-image]').forEach((img) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'trace-zoom'
    button.setAttribute(
      'aria-label',
      japanese ? '実画面を拡大して確認' : 'Enlarge the recorded interface'
    )
    img.before(button)
    button.append(img)
    button.addEventListener('click', () => {
      fullImage.src = img.src
      fullImage.alt = img.alt
      dialog.showModal()
      viewport.scrollLeft = 0
    })
  })
}

const viewControls = document.querySelector('.bridge-views')
if (viewControls) {
  viewControls.hidden = false
  viewControls.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => {
      bridgeView = button.dataset.bridgeView
      viewControls
        .querySelectorAll('button')
        .forEach((other) =>
          other.setAttribute('aria-pressed', String(other === button))
        )
      cancelAnimationFrame(frame)
      drawBridge()
    })
  })
}

document.querySelector('.bridge-example')?.addEventListener('click', () => {
  const activeCase = document.querySelector('.trace-case:not([hidden])')
  activeCase?.querySelectorAll('.trace-step button')[bridgeStage]?.click()
})

document.querySelector('.proof-image-link')?.addEventListener('click', () => {
  document.querySelector('[data-trace-project="Kakiba"]')?.click()
  document
    .querySelector('[data-trace-case="Kakiba"]')
    ?.querySelectorAll('.trace-step button')
    [bridgeStage]?.click()
})
