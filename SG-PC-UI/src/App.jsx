import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import './App.css'
import Workspace from './Workspace'

const theme = createTheme({
  palette: {
    background: {
      default: '#f5f5f5'
    }
  },
  components: {
    MuiPaper: {
      defaultProps: {
        elevation: 0
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none'
        }
      }
    }
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Workspace />
    </ThemeProvider>
  )
}

export default App
