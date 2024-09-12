import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import Navigation from './components/Navigation/Navigation';
import * as sessionActions from './store/session';
import SpotList from './components/Spot/SpotList';
import SpotDetail from './components/Spot/SpotDetail';
import NewSpot from './components/Spot/NewSpot'
import ManageSpot from './components/Spot/ManageSpot'

function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => {
      setIsLoaded(true)
    });
  }, [dispatch]);

  return (
    <>
      <div>
        <Navigation isLoaded={isLoaded} />
        </div>
      {isLoaded && <Outlet />}
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <SpotList />
      },
      {
        path: '/spots/:spotId',
        element: <SpotDetail />
      },
      {
        path: '/spots',
        element: <NewSpot isEdit={false}/>
      },
      {
        path: '/spots/current',
        element: <ManageSpot />
      },
      {
        path: '/spots/:spotId/update',
        element: <NewSpot isEdit={true} />
      }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;