import { calcAxisScores, determineResult } from './engine.js'
import { createQuiz } from './quiz.js'
import { renderResult } from './result.js'

async function loadJSON(path) {
  const res = await fetch(path)
  return res.json()
}

async function init() {
  const [questionsData, dims, types, config] = await Promise.all([
    loadJSON(new URL('../data/questions.json', import.meta.url).href),
    loadJSON(new URL('../data/dimensions.json', import.meta.url).href),
    loadJSON(new URL('../data/types.json', import.meta.url).href),
    loadJSON(new URL('../data/config.json', import.meta.url).href),
  ])

  const pages = {
    intro: document.getElementById('page-intro'),
    quiz: document.getElementById('page-quiz'),
    result: document.getElementById('page-result'),
  }

  function showPage(name) {
    Object.values(pages).forEach((p) => p.classList.remove('active'))
    pages[name].classList.add('active')
    window.scrollTo(0, 0)
  }

  function onComplete(answers) {
    const axisScores = calcAxisScores(answers, questionsData.questions, dims.order)
    const result = determineResult(axisScores, dims.order, types.standard, types.special, config.scoring)
    renderResult(result, axisScores, dims.order, dims.definitions, config)
    showPage('result')
  }

  const quiz = createQuiz(questionsData, config, onComplete)

  const ui = config.display?.ui || {}
  if (ui.introTitleHtml) {
    document.getElementById('intro-title').innerHTML = ui.introTitleHtml
  }
  const leadEl = document.getElementById('intro-lead')
  if (leadEl && ui.introLead) {
    leadEl.textContent = ui.introLead
  }

  document.getElementById('btn-start').addEventListener('click', () => {
    quiz.start()
    showPage('quiz')
  })

  document.getElementById('btn-restart').addEventListener('click', () => {
    quiz.start()
    showPage('quiz')
  })
}

init()
