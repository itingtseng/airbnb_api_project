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
router.delete(
  '/spot-images/:id',
  async (req, res) => {
    const { user } = req;
    if (user) {
      let image = await Image.findOne({
        where:
        {
          id: req.params.id,
          imageableType: 'spot'
        }
      })
      if (image) {
        let spot = await Spot.findAll({
            ownerId: user.id
        })
        if (spot.id === image.imageableId) {
          await image.destroy()
          res.status(200).json({     
              status: "success",
              message: `Successfully deleted`,
          });
        } else {
          return res.status(401).json({
              message: "Authentication required"
          })
        }
      } else return res.status(404).json({
          message: "Spot Image couldn't be found"
      });
    } else {
      return res.status(401).json({
          message: "Authentication required"
      })
    }
  }
);

// Delete a Review Image
router.delete(
  '/review-images/:id',
  async (req, res) => {
    const { user } = req;
    if (user) {
      let image = await Image.findOne({
        where:
        {
          id: req.params.id,
          imageableType: 'review'
        }
      })
      if (image) {
        let review = await Review.findAll({
          userId: user.id
        })
        if (review.id === image.imageableId) {
          await image.destroy()
          res.status(200).json({
            status: "success",
            message: `Successfully deleted`,
          });
        } else {
          return res.status(401).json({
              message: "Authentication required"
          })
        }
      } else {
        return res.status(404).json({
          message: "Review Image couldn't be found"
        })
      };
    } else {
      return res.status(401).json({
          message: "Authentication required"
      })
    }    
  }
);

router.use('/session', sessionRouter);

router.use('/users', usersRouter);

router.use('/spots', spotsRouter);

router.use('/reviews', reviewsRouter);

router.use('/bookings', bookingsRouter);

router.post('/test', (req, res) => {
  res.json({ requestBody: req.body });
});

module.exports = router;