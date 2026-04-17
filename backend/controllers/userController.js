const User = require('../models/User');
const Workout = require('../models/Workout');
const Nutrition = require('../models/Nutrition');
const Progress = require('../models/Progress');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'placeholder') {
  cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
  });
}

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.status(200).json({ success: true, data: user });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update user profile & avatar
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.fitnessGoals = req.body.fitnessGoals || user.fitnessGoals;
    if (req.body.preferences) {
      user.preferences = req.body.preferences;
    }

    // Handle Cloudinary Base64 Image Upload
    if (req.body.avatarBase64) {
      if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'placeholder') {
        return res.status(400).json({ success: false, message: 'Cloudinary credentials missing in server config.' });
      }

      try {
        const uploadResponse = await cloudinary.uploader.upload(req.body.avatarBase64, {
          folder: 'fitforge_avatars',
        });
        user.avatar = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary Upload Error:', uploadError);
        return res.status(500).json({ success: false, message: 'Image upload failed' });
      }
    }

    if (req.body.password) {
       // Using authController password logic would be ideal if implemented, but we avoid updating pw here directly.
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        fitnessGoals: updatedUser.fitnessGoals,
        preferences: updatedUser.preferences,
        role: updatedUser.role,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete user account (Cascade)
// @route   DELETE /api/users/profile
// @access  Private
const deleteUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    // Cascade delete all user data
    await Workout.deleteMany({ user: userId });
    await Nutrition.deleteMany({ user: userId });
    await Progress.deleteMany({ user: userId });
    
    await User.findByIdAndDelete(userId);

    res.cookie('refreshToken', '', {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({ success: true, message: 'Account permanently deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile
};
