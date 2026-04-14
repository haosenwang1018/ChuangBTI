import { shuffle } from './utils.js'

/**
 * 答题控制器 — 简化版：无特殊题插入
 * @param {Object} questionsData { questions: [...] }
 * @param {Object} config        config.json
 * @param {Function} onComplete  (answers) => void
 */
export function createQuiz(questionsData, config, onComplete) {
  let queue = shuffle(questionsData.questions)
  let current = 0
  let answers = {}

  const els = {
    fill: document.getElementById('progress-fill'),
    text: document.getElementById('progress-text'),
    qText: document.getElementById('question-text'),
    options: document.getElementById('options'),
    prev: document.getElementById('btn-prev'),
  }

  if (els.prev) els.prev.addEventListener('click', goPrev)

  function updateProgress() {
    const pct = (current / queue.length) * 100
    els.fill.style.width = pct + '%'
    els.text.textContent = `${current + 1} / ${queue.length}`
  }

  function renderQuestion() {
    const q = queue[current]
    els.qText.textContent = q.text
    els.options.innerHTML = ''
    const picked = answers[q.id]
    q.options.forEach((opt) => {
      const btn = document.createElement('button')
      btn.className = 'btn btn-option'
      if (picked !== undefined && picked === opt.value) btn.classList.add('selected')
      btn.textContent = opt.label
      btn.addEventListener('click', () => selectOption(q, opt))
      els.options.appendChild(btn)
    })
    if (els.prev) els.prev.disabled = current === 0
    updateProgress()
  }

  function goPrev() {
    if (current === 0) return
    current--
    renderQuestion()
  }

  function selectOption(question, option) {
    answers[question.id] = option.value
    current++
    if (current >= queue.length) {
      onComplete(answers)
    } else {
      renderQuestion()
    }
  }

  function start() {
    current = 0
    answers = {}
    queue = shuffle(questionsData.questions)
    renderQuestion()
  }

  return { start, renderQuestion }
}
