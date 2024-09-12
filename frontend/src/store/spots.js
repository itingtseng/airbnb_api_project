import { csrfFetch } from "./csrf";
export const SET_SPOTS = "spots/setSpots";
export const SET_SPOT_DETAILS = "spots/setSpotDetails";
export const ADD_NEW_SPOT = "spots/addNewSpot";
export const UPDATE_SPOT = "spots/UPDATE_SPOT";
export const DELETE_SPOT = "spots/DELETE_SPOT";

const setSpots = (spots) => ({
  type: SET_SPOTS,
  spots,
});

const setSpotDetails = (spot) => ({
  type: SET_SPOT_DETAILS,
  spot,
});

const addNewSpot = (spot) => ({
  type: ADD_NEW_SPOT,
  spot,
});

const updateSpotAction = (spot) => ({
  type: UPDATE_SPOT,
  spot,
});

const deleteSpotAction = (spotId) => ({
  type: DELETE_SPOT,
  spotId,
});

const initialState = {
  spots: [],
  spotDetails: null,
  newSpot: null,
};

const spotsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_SPOTS:
      return {
        ...state,
        spots: action.spots,
      };
    case SET_SPOT_DETAILS:
      return {
        ...state,
        spotDetails: action.spot,
      };
    case ADD_NEW_SPOT:
      return {
        ...state,
        newSpot: action.spot,
      };
    case UPDATE_SPOT:
      return {
        ...state,
        spots: state.spots.map((spot) =>
          spot.id === action.spot.id ? action.spot : spot
        ),
        spotDetails: action.spot,
      };
    case DELETE_SPOT:
      return {
        ...state,
        spots: state.spots.filter((spot) => spot.id !== action.spotId),
      };
    default:
      return state;
  }
};

export const fetchSpots = () => async (dispatch) => {
  const res = await csrfFetch("/api/spots");
  const data = await res.json();
  if (res.ok) {
    dispatch(setSpots(data));
  } else {
    throw res;
  }
};

export const fetchSpotDetails = (spotId) => async (dispatch) => {
    const res = await csrfFetch(`/api/spots/${spotId}`);
    const data = await res.json();
    if (res.ok) {
      dispatch(setSpotDetails(data));
    } else {
      throw res;
    }
  };

const addImagesToSpot = async (spotId, previewImage, otherImageUrls = []) => {
  // Add the preview image
  if (previewImage) {
    await csrfFetch(`/api/spots/${spotId}/images`, {
      method: "POST",
      body: JSON.stringify({
        url: previewImage,
        preview: true,
      }),
    });
  }

  // Ensure otherImageUrls is iterable
  if (Array.isArray(otherImageUrls)) {
    for (let url of otherImageUrls) {
      if (url) {
        await csrfFetch(`/api/spots/${spotId}/images`, {
          method: "POST",
          body: JSON.stringify({
            url,
            preview: false,
          }),
        });
      }
    }
  } else {
    console.error("otherImageUrls is not an array");
  }
};

export const createSpot = (spotData) => async (dispatch) => {
    try {
      const response = await csrfFetch("/api/spots", {
        method: "POST",
        body: JSON.stringify(spotData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw errorData; // Throw the parsed error data directly
      }
  
      const newSpot = await response.json();
  
      dispatch(addNewSpot(newSpot.data));
  
      if (spotData.previewImage || spotData.otherImageUrls?.length > 0) {
        await addImagesToSpot(
          newSpot.data.id,
          spotData.previewImage,
          spotData.otherImageUrls
        );
      }
  
      return newSpot.data;
    } catch (error) {
      console.error("Error creating spot:", error);
      throw error; // Re-throw the error data
    }
  };
  

  export const updateSpot = (spotId, spotData) => async (dispatch) => {
    try {
      const response = await csrfFetch(`/api/spots/${spotId}`, {
        method: "PUT",
        body: JSON.stringify(spotData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw errorData; // Throw the parsed error data directly
      }
  
      const updatedSpot = await response.json();
  
      if (spotData.previewImage || spotData.otherImageUrls?.length > 0) {
        await addImagesToSpot(
          spotId,
          spotData.previewImage,
          spotData.otherImageUrls
        );
      }
  
      dispatch(updateSpotAction(updatedSpot.data));
      return updatedSpot.data;
    } catch (error) {
      console.error("Error updating spot:", error);
      throw error; // Re-throw the error data
    }
  };
  

export const deleteSpot = (spotId) => async (dispatch) => {
  try {
    const response = await csrfFetch(`/api/spots/${spotId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      dispatch(deleteSpotAction(spotId));
    } else {
      const errorData = await response.json();
      console.error("Error deleting spot:", errorData);
    }
  } catch (error) {
    console.error("Error deleting spot:", error);
  }
};

export default spotsReducer;
