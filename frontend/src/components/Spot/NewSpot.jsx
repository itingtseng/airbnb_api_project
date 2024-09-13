import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createSpot, updateSpot, fetchSpotDetails } from "../../store/spots";

function NewSpot({ isEdit }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { spotId } = useParams();
  const spotDetails = useSelector((state) => state.spots.spotDetails);
  const [country, setCountry] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [previewImage, setPreviewImage] = useState({
    imageUrls: "",
    otherImageUrls: ["", "", "", ""],
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e, index) => {
    if (index === 0) {
      setPreviewImage({ ...previewImage, imageUrls: e.target.value });
    } else {
      const updatedImages = [...previewImage.otherImageUrls];
      updatedImages[index - 1] = e.target.value;
      setPreviewImage({ ...previewImage, otherImageUrls: updatedImages });
    }
  };

  useEffect(() => {
    const errs = {};
    if (!country) {
      errs.country = "Country field is required";
    }
    if (!address) {
      errs.address = "Address field is required";
    }
    if (!city) {
      errs.city = "City field is required";
    }
    if (!state) {
      errs.state = "State field is required";
    }
    if (!lat) {
      errs.lat = "Latitude field is required";
    }
    if (!lng) {
      errs.lng = "Longitude field is required";
    }
    if (!description) {
      errs.description = "Description field is required";
    }
    if (!name) {
      errs.name = "Name field is required";
    }
    if (!price) {
      errs.price = "Price field is required";
    }
    if (!previewImage) {
      errs.previewImage = "PreviewImage field is required";
    }
    if (description.length < 30) {
      errs.description = "Please write at least 30 characters";
    }
    setErrors(errs);
  }, [
    country,
    address,
    city,
    state,
    lat,
    lng,
    description,
    name,
    price,
    previewImage,
  ]);

  useEffect(() => {
    if (isEdit && spotId) {
      dispatch(fetchSpotDetails(spotId));
    }
  }, [dispatch, spotId, isEdit]);

  useEffect(() => {
    if (isEdit && spotDetails) {
      setCountry(spotDetails.country || "");
      setAddress(spotDetails.address || "");
      setCity(spotDetails.city || "");
      setState(spotDetails.state || "");
      setLat(spotDetails.lat || "");
      setLng(spotDetails.lng || "");
      setDescription(spotDetails.description || "");
      setName(spotDetails.name || "");
      setPrice(spotDetails.price || "");
      setPreviewImage({
        imageUrls: spotDetails.SpotImages?.find(image => image.preview)?.url || '',
        otherImageUrls: spotDetails.SpotImages?.filter(image => !image.preview).map(image => image.url) || ['', '', '', ''],
      });
    }
  }, [spotDetails, isEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
  
    const spotData = {
      country,
      address,
      city,
      state,
      lat,
      lng,
      description,
      name,
      price,
      previewImage: previewImage.imageUrls,
      otherImageUrls: previewImage.otherImageUrls || [],
    };
  
    const action = isEdit ? updateSpot(spotId, spotData) : createSpot(spotData);
  
    dispatch(action)
      .then((updatedSpot) => {
        // Reset form fields after submission
        setCountry("");
        setAddress("");
        setCity("");
        setState("");
        setLat("");
        setLng("");
        setDescription("");
        setName("");
        setPrice("");
        setPreviewImage({
          imageUrls: "",
          otherImageUrls: ["", "", "", ""],
        });
        navigate(`/spots/${updatedSpot.id}`);
      })
      .catch((errorData) => {
        if (errorData && errorData.errors) {
          setErrors(errorData.errors);
        } else {
          setErrors({ general: "An error occurred. Please try again." });
        }
      });
  };
  

  return (
    <form className="new-spot" onSubmit={handleSubmit}>
      <h1>Create a New Spot</h1>
      <h2>Where&#39;s your place located?</h2>
      <p>
        Guests will only get your exact address once they booked a reservation.
      </p>
      <label>
        Country
        <input
          type="text"
          name="country"
          placeholder="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />
      </label>
      <p>{errors.country}</p>
      <label>
        Street Address
        <input
          type="text"
          name="address"
          placeholder="Street Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </label>
      <p>{errors.address}</p>
      <label>
        City
        <input
          type="text"
          name="city"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </label>
      <p>{errors.city}</p>
      <label>
        State
        <input
          type="text"
          name="state"
          placeholder="State"
          value={state}
          onChange={(e) => setState(e.target.value)}
        />
      </label>
      <p>{errors.state}</p>
      <label>
        Latitude
        <input
          type="number"
          name="lat"
          placeholder="Latitude"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
        />
      </label>
      <p>{errors.lat}</p>
      <label>
        Longitude
        <input
          type="number"
          name="lng"
          placeholder="Longitude"
          value={lng}
          onChange={(e) => setLng(e.target.value)}
        />
      </label>
      <p>{errors.lng}</p>
      <h2>Describe your place to guests</h2>
      <p>
        Mention the best features of your space, any special amentities like
        fast wifi or parking, and what you love about the neighborhood.
      </p>
      <label>
        <textarea
          type="text"
          name="description"
          placeholder="Please write at least 30 characters"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <p>{errors.description}</p>
      <h2>Create a title for your spot</h2>
      <p>
        Catch guests&#39; attention with a spot title that highlights what makes
        your place special.
      </p>
      <label>
        Name of your spot
        <input
          type="text"
          name="name"
          placeholder="Name of your spot"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <p>{errors.name}</p>
      <h2>Set a base price for your spot</h2>
      <p>
        Competitive pricing can help your listing stand out and rank higher in
        search results.
      </p>
      <label>
        <input
          type="number"
          name="price"
          placeholder="Price per night (USD)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </label>
      <p>{errors.price}</p>
      <h2>Liven up your spot with photos</h2>
      <p>Submit a link to at least one photo to publish your spot.</p>
      <label>
        Preview Image URL
        <input
          type="text"
          name="previewImage"
          placeholder="Preview Image URL"
          value={previewImage.imageUrls}
          onChange={(e) => handleInputChange(e, 0)}
        />
      </label>
      {previewImage.imageUrls && (
        <img
          src={previewImage.imageUrls}
          alt="Preview"
          style={{ width: "200px", height: "150px" }}
        />
      )}
      {previewImage.otherImageUrls.map((url, index) => (
  <div key={index}>
    <input
      type="text"
      placeholder="Image URL"
      value={url}
      onChange={(e) => handleInputChange(e, index + 1)} // +1 since the first input is for the preview image
    />
    {url && <img src={url} alt={`Other Image ${index + 1}`} style={{ width: '200px', height: '150px' }} />}
  </div>
))}

      <p>{errors.previewImage}</p>
      <button type="submit" disabled={Object.keys(errors).length}>
        {isEdit ? "Update your Spot" : "Create Spot"}
      </button>
    </form>
  );
}

export default NewSpot;
