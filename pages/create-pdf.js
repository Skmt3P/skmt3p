const { mdToPdf } = require('md-to-pdf')
const func = async () => {
  try {
    await mdToPdf({ path: './pages/PORTFOLIO.md' }, { dest: './pages/PORTFOLIO.pdf' })
    console.log('PDF作成完了: PORTFOLIO.pdf')
  } catch (e) {
    console.error('エラー:', e)
    process.exit(1)
  }
}

func()
