import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSpots } from '../../store/spots';
import { NavLink } from 'react-router-dom';
import './SpotList.css';

function SpotList() {
  console.log('SpotList component rendered');
  const dispatch = useDispatch();
  const spots = useSelector(state => state.spots.spots);

  useEffect(() => {
    dispatch(fetchSpots());
  }, [dispatch]);

  console.log('Spots data:', spots);

  return (
    <div>
      {/* Ensure spots is defined and has items */}
      {spots?.length > 0 ? (
        spots.map(spot => (
          <NavLink key={spot.id} to={`/spots/${spot.id}`} className="spot-tile-link">
          <div key={spot.id} className="spot-tile" title={spot.name}>
              <h2>{spot.name}</h2>
              <img src={spot.previewImage || 'default-image-url'} alt={`${spot.name} thumbnail`} className="spot-thumbnail" title={spot.name}/>
            <p>{spot.city}, {spot.state}</p>
            <p>{spot.avgRating ? `${spot.avgRating.toFixed(1)} ★` : 'New'}</p>
            <p>${spot.price} night</p>
            </div>
          </NavLink>
        ))
      ) : (
        <p>No spots available</p>
      )}
    </div>
  );
}

export default SpotList;
