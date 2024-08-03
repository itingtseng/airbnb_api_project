const router = require('express').Router();
const sessionRouter = require('./session.js');
const usersRouter = require('./users.js');
const spotsRouter = require('./spots.js');
const reviewsRouter = require('./reviews.js');
const bookingsRouter = require('./bookings.js');
const { restoreUser } = require("../../utils/auth.js");

router.post('/test', function(req, res) {
    res.json({ requestBody: req.body });
});
  
const { setTokenCookie } = require('../../utils/auth.js');
const { User, Image, Spot, Review } = require('../../db/models');
router.get('/set-token-cookie', async (_req, res) => {
  const user = await User.findOne({
    where: {
      username: 'Demo-lition'
    }
  });
  setTokenCookie(res, user);
  return res.json({ user: user });
});

// GET /api/restore-user

router.use(restoreUser);

router.get(
  '/restore-user',
  (req, res) => {
    return res.json(req.user);
  }
);

router.use(restoreUser);

// GET /api/require-auth
const { requireAuth } = require('../../utils/auth.js');
router.get(
  '/require-auth',
  requireAuth,
  (req, res) => {
    return res.json(req.user);
  }
);



// Delete a Spot Image
router.delete('/spot-images/:id', requireAuth, async (req, res) => {
  const { user } = req
  const imageId = parseInt(req.params.id, 10); // Ensure imageId is an integer

  if (isNaN(imageId)) {
        return res.status(400).json({
            message: "Invalid image ID"
        });
  }
  let image = await Image.findOne({
    where:
    {
      id: imageId,
      imageableType: 'spot'
    }
  })
  if (image) {
    let spots = await Spot.findAll({
        ownerId: user.id
    })
    let spotFound = spots.some(spot => spot.id === image.imageableId);
    if (spotFound) {
      await image.destroy()
      res.status(200).json({     
          status: "success",
          message: `Successfully deleted`,
      });
    } else {
      return res.status(403).json({
          message: "Forbidden"
      })
    }
  } else return res.status(404).json({
      message: "Spot Image couldn't be found"
  });    
});

// Delete a Review Image
router.delete('/review-images/:id', requireAuth, async (req, res) => {
  const { user } = req
  const imageId = parseInt(req.params.id, 10); // Ensure imageId is an integer

  if (isNaN(imageId)) {
        return res.status(400).json({
            message: "Invalid image ID"
        });
  }
  let image = await Image.findOne({
    where:
    {
      id: imageId,
      imageableType: 'review'
    }
  })
  if (image) {
    let reviews = await Review.findAll({
      userId: user.id
    })
    let reviewFound = reviews.some(review => review.id === image.imageableId);
    if (reviewFound) {
      await image.destroy()
      res.status(200).json({
        status: "success",
        message: `Successfully deleted`,
      });
    } else {
      return res.status(403).json({
          message: "Forbidden"
      })
    }
  } else {
    return res.status(404).json({
      message: "Review Image couldn't be found"
    })
  };     
});

router.use('/session', sessionRouter);

router.use('/users', usersRouter);

router.use('/spots', spotsRouter);

router.use('/reviews', reviewsRouter);

router.use('/bookings', bookingsRouter);

router.post('/test', (req, res) => {
  res.json({ requestBody: req.body });
});

module.exports = router;