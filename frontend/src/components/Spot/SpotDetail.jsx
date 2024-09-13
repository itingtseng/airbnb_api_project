// SpotDetail component
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSpotDetails } from "../../store/spots";
import { useParams } from "react-router-dom";
import "./SpotDetail.css";
import NewReview from "../Review/NewReview";
import { fetchReviews, deleteReview } from "../../store/reviews";
import OpenModalButton from "../OpenModalButton/OpenModalButton";
import DeleteReviewModal from "../Review/DeleteReview";

function SpotDetail() {
  const { spotId } = useParams();
  const dispatch = useDispatch();
  const spotDetails = useSelector((state) => state.spots.spotDetails);
  const sessionUser = useSelector((state) => state.session.user);
  const reviews = useSelector((state) => state.reviews.reviews);
  const [reviewList, setReviewList] = useState([]);

  useEffect(() => {
    if (spotId) {
      dispatch(fetchSpotDetails(spotId));
      dispatch(fetchReviews(spotId));
    }
  }, [dispatch, spotId]);

  useEffect(() => {
    setReviewList(reviews);
  }, [reviews]);

  if (!spotDetails) {
    return <p>Loading...</p>; // Or show a spinner/loading state
  }
  const {
    name,
    city,
    state,
    country,
    SpotImages = [],
    description,
    Owner = {},
    price,
    avgStarRating,
    numReviews,
  } = spotDetails;
  const largeImage = SpotImages.find((image) => image.preview) || SpotImages[0];
  const smallImages = SpotImages.filter((image) => !image.preview).slice(0, 4);
  const handleReserveClick = () => {
    alert("Feature coming soon");
  };
  const isOwner = sessionUser && sessionUser.id === spotDetails.ownerId;

  const hasUserPostedReview = reviews.some(
    (review) => review.userId === sessionUser?.id
  );

  const sortedReviews = reviewList.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const handleReviewSubmit = (newReview) => {
    setReviewList([newReview, ...reviewList]);
    dispatch(fetchReviews(spotId));
  };

  const handleConfirmDelete = (reviewId) => {
    dispatch(deleteReview(reviewId))
      .then(() => {
        setReviewList(reviewList.filter((review) => review.id !== reviewId));
      })
      .catch((err) => console.error("Failed to delete review:", err));
  };

  return (
    <div className="spot-detail">
      <div className="spot-detail-main">
        <div className="large-image">
          {largeImage && (
            <img
              src={largeImage.url}
              alt={`${name} large`}
              className="large-image-img"
            />
          )}
        </div>
        <div className="small-images">
          {smallImages.length > 0 &&
            smallImages.map((image) => (
              <img
                key={image.id}
                src={image.url}
                alt={`${name} small`}
                className="small-image"
              />
            ))}
        </div>
      </div>

      <div className="spot-detail-row">
        <div className="spot-detail-info">
          <h1>{name}</h1>
          <p>
            <strong>Location:</strong> {city}, {state}, {country}
          </p>
          <p>
            <strong>Hosted by:</strong>{" "}
            {Owner ? `${Owner.firstName} ${Owner.lastName}` : "N/A"}
          </p>
          <p>{description}</p>
        </div>

        <div className="callout-info">
          <p>
            <strong>Price:</strong> ${price} night
          </p>
          <p>
            <strong>Rating: </strong>
            {avgStarRating ? `${avgStarRating.toFixed(1)} ★` : "New ★"}
            {numReviews > 0 &&
              ` · ${numReviews} Review${numReviews > 1 ? "s" : ""}`}
          </p>
          <button onClick={handleReserveClick} className="reserve-button">
            Reserve
          </button>
        </div>
      </div>

      <div className="review-summary">
        <h2>
          <strong>Rating: </strong>
          {avgStarRating ? (
            `${avgStarRating.toFixed(1)} ★`
          ) : (
            <>
              New <span>★</span>
            </>
          )}
          {numReviews > 0 && (
            <>
              {" "}
              · {numReviews} Review{numReviews > 1 ? "s" : ""}
            </>
          )}
        </h2>
        {!isOwner && sessionUser && !hasUserPostedReview && (
          <OpenModalButton
            buttonText="Post Your Review"
            modalComponent={
              <NewReview spotId={spotId} onReviewSubmit={handleReviewSubmit} />
            }
          />
        )}
      </div>
      <div className="reviews">
        {sortedReviews.length > 0 ? (
          sortedReviews.map((review) => {
            const reviewDate = new Date(review.createdAt).toLocaleDateString(
              "en-US",
              {
                year: "numeric",
                month: "long",
              }
            );

            return (
              <div key={review.id} className="review">
                <p>
                  <strong>{review.User?.firstName}</strong>
                  <span> · {reviewDate}</span>
                </p>
                <p>{review.review}</p>
                {review.userId === sessionUser?.id && (
                  <OpenModalButton
                    buttonText="Delete"
                    modalComponent={
                      <DeleteReviewModal
                        onConfirm={() => handleConfirmDelete(review.id)}
                      />
                    }
                  />
                )}
              </div>
            );
          })
        ) : (
          <p>No reviews yet</p>
        )}
      </div>
    </div>
  );
}

export default SpotDetail;
