import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useModal } from "../../context/Modal";
import { createReview } from "../../store/reviews";
import "./Review.css";

const STARS = [1, 2, 3, 4, 5];

function NewReview({ spotId, onReviewSubmit }) {
  const dispatch = useDispatch();
  const [stars, setStars] = useState("");
  const [review, setReview] = useState("");
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();
  const sessionUser = useSelector((state) => state.session.user);

  useEffect(() => {
    const errs = {};
    if (!stars) {
      errs.stars = "Stars field is required";
    }
    if (!review) {
      errs.review = "Review field is required";
    }
    if (review.length < 10) {
      errs.review = "Please write at least 10 characters";
    }
    setErrors(errs);
  }, [stars, review]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    dispatch(createReview(spotId, { review, stars, userId: sessionUser?.id }))
      .then((newReview) => {
        onReviewSubmit(newReview);
        closeModal();
        setReview("");
        setStars("");
      })
      .catch(async (res) => {
        const data = await res.json();
        if (data && data.errors) {
          setErrors(data.errors);
        }
      });
  };
  return (
    <>
      <form onSubmit={handleSubmit}>
        <h1>How was your stay?</h1>
        <label>
          <textarea
            type="text"
            name="review"
            placeholder="Leave your review here..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />
        </label>
        <p>{errors.review}</p>
        <div className="star-rating">
          {STARS.map((star) => (
            <button
              key={star}
              type="button"
              className={`star ${stars >= star ? "star-selected" : ""}`}
              onClick={() => setStars(star)}
            >
              ★
            </button>
          ))}
        </div>
        <p>{errors.stars}</p>
        <button className='modal-button' type="submit" disabled={Object.keys(errors).length}>
          Submit Your Review
        </button>
      </form>
    </>
  );
}

export default NewReview;
