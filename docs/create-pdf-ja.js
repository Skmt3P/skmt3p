const { mdToPdf } = require('md-to-pdf')
const func = async () => {
  try {
    await mdToPdf(
      { path: './docs/ja/PORTFOLIO.md' }, 
      { 
        dest: './docs/ja/PORTFOLIO.pdf',
        launch_options: {
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
      }
    )
    console.log('PDF作成完了: ja/PORTFOLIO.pdf')
  } catch (e) {
    console.error('エラー:', e)
    process.exit(1)
  }
}

func()
