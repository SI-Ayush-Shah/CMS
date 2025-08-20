import { createBrowserRouter } from 'react-router-dom'
import App from '../App'
import ListingPage from '../pages/ListingPage'
import DetailsPage from '../pages/DetailsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <ListingPage />
      },
      {
        path: 'details/:id',
        element: <DetailsPage />
      }
    ]
  }
]) 