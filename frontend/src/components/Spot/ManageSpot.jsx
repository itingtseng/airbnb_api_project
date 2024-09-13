import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSpots, deleteSpot } from "../../store/spots";
import { NavLink, useNavigate } from "react-router-dom";
import OpenModalButton from "../OpenModalButton/OpenModalButton";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";
import "./SpotList.css";

function ManageSpot() {
  const dispatch = useDispatch();
  const spots = useSelector((state) => state.spots.spots);
  const sessionUser = useSelector((state) => state.session.user);
  const navigate = useNavigate();

  const [selectedSpotId, setSelectedSpotId] = useState(null);

  useEffect(() => {
    dispatch(fetchSpots());
  }, [dispatch]);

  const userSpots = spots?.filter((spot) => spot.ownerId === sessionUser?.id);

  const handleUpdateClick = (spotId) => {
    navigate(`/spots/${spotId}/update`);
  };

  const handleDeleteClick = (spotId) => {
    setSelectedSpotId(spotId);
  };

  return (
    <div>
      <h1>Manage Spots</h1>
      {userSpots?.length === 0 ? (
        <NavLink to="/spots" className="nav-link">
          <button className="create-new-spot-button">Create a New Spot</button>
        </NavLink>
      ) : (
        userSpots.map((spot) => (
            <div key={spot.id} className={`spot-tile ${selectedSpotId === spot.id ? 'selected' : ''}`} title={spot.name}>
            <NavLink to={`/spots/${spot.id}`} className="spot-tile-link">
              <h2>{spot.name}</h2>
              <img
                src={spot.previewImage || "default-image-url"}
                alt={`${spot.name} thumbnail`}
                className="spot-thumbnail"
                title={spot.name}
              />
              <p>
                {spot.city}, {spot.state}
              </p>
              <p>{spot.avgRating ? `${spot.avgRating.toFixed(1)} ★` : "New"}</p>
              <p>${spot.price} night</p>
            </NavLink>
            <button
              onClick={() => handleUpdateClick(spot.id)}
              className="update-button"
            >
              Update
            </button>
            <OpenModalButton
              buttonText="Delete"
              onButtonClick={() => handleDeleteClick(spot.id)}
              modalComponent={
                <ConfirmationModal
                  onConfirm={() => {
                    dispatch(deleteSpot(spot.id))
                      .then(() => {
                        setSelectedSpotId(null); // Reset the selected spot after deletion
                      })
                      .catch((error) => {
                        console.error("Failed to delete spot:", error);
                      });
                  }}
                />
              }
            />
          </div>
        ))
      )}
    </div>
  );
}

export default ManageSpot;
