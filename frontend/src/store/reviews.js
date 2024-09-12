import { csrfFetch } from './csrf';
export const SET_REVIEWS = 'spots/setReviews';
export const ADD_NEW_REVIEW = 'reviews/addNewReview';
export const DELETE_REVIEW = 'reviews/deleteReview';

const setReviews = (reviews) => ({
    type: SET_REVIEWS,
    reviews
  });

const addNewReview = (review) => ({
    type: ADD_NEW_REVIEW,
    review
});

const deleteReviewAction = (reviewId) => ({
    type: DELETE_REVIEW,
    reviewId,
  });

const initialState = {
    reviews: [],
    newReview: null
};
  
const reviewsReducer = (state = initialState, action) => {
    switch (action.type) {
      case SET_REVIEWS:
            return {
              ...state,
              reviews: action.reviews
            };
      case ADD_NEW_REVIEW:
        return {
          ...state,
          reviews: [action.review, ...state.reviews]
        };
        case DELETE_REVIEW:
      return {
        ...state,
        reviews: state.reviews.filter(review => review.id !== action.reviewId) // Filter out the deleted review
      };
      default:
        return state;
    }
};


export const fetchReviews = (spotId) => async (dispatch) => {
    const res = await csrfFetch(`/api/spots/${spotId}/reviews`);
    const data = await res.json();
    if (res.ok) {
      dispatch(setReviews(data));
    } else {
      throw res;
    }
  };
  
export const createReview = (spotId, reviewData) => async (dispatch) => {
    const { review, stars, userId } = reviewData;
    const response = await csrfFetch(`/api/spots/${spotId}/reviews`, {
      method: 'POST',
      body: JSON.stringify({ review, stars, userId }),
    });
    const newReview = await response.json();
    dispatch(addNewReview(newReview));
    return newReview;
};


export const deleteReview = (reviewId) => async (dispatch) => {
    const response = await csrfFetch(`/api/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  
    if (response.ok) {
      dispatch(deleteReviewAction(reviewId));
    } else {
      const error = await response.json();
      throw new Error(error.message);
    }
  };

export default reviewsReducer;