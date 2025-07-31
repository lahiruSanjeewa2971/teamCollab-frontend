import {Provider} from 'react-redux'
import {store} from './redux/store'
import AppRouter from './router/AppRouter'
import { ToastContainer } from 'react-toastify'

function App() {
  return (
    <Provider store={store}>
      <AppRouter/>
      <ToastContainer position='top-right' />
    </Provider>
  )
}

export default App
