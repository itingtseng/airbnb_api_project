import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton';
import logo from '../../../src/logo.png';
import './Navigation.css';

function Navigation({ isLoaded }) {
  const sessionUser = useSelector(state => state.session.user);

  return (
    <nav>
        <div className="nav-left">
            <NavLink to="/" className="nav-link">
                <img src={logo} alt="Logo" className="logo" />
                  <span className="app-name">Airbnb</span>
                  {/* <p>Home</p> */}
            </NavLink>
        </div>
        <div className="nav-right">
            {sessionUser && (
                <NavLink to="/spots" className="nav-link">
                    <p>Create a New Spot</p>
                </NavLink>
            )}
            {isLoaded && (
                      <ProfileButton user={sessionUser} />
            )}   
        </div>
    </nav>
  );
}

export default Navigation;