const { mdToPdf } = require('md-to-pdf')
const func = async () => {
  try {
    await mdToPdf({ path: './pages/ja/PORTFOLIO.md' }, { dest: './pages/ja/PORTFOLIO.pdf' })
    console.log('PDF作成完了: ja/PORTFOLIO.pdf')
  } catch (e) {
    console.error('エラー:', e)
    process.exit(1)
  }
}

func()
