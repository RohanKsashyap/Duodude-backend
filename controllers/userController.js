import  User  from "../models/User.js";

// Get current logged-in user's profile
export const getProfile = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    res.json(req.user);
  } catch (error) {
    console.error("Error getting profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update current user's profile
export const  updateProfile = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    // You can restrict which fields are updatable for security
    const allowedUpdates = ['name', 'email', 'password', 'addresses'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ message: "Invalid updates!" });
    }

    updates.forEach(update => {
      req.user[update] = req.body[update];
    });

    await req.user.save();
    res.json(req.user);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(400).json({ message: "Failed to update profile" });
  }
};

// Delete current user's account
export const deleteProfile = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    await req.user.remove();
    res.json({ message: "User account deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

// Admin: get all users
export const getAllUsers = async (req, res) => {
  try {
    // optionally check admin permissions here
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: get user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: update user by ID
export const updateUserById = async (req, res) => {
  try {
    const allowedUpdates = ['name', 'email', 'role']; // restrict fields admins can update
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ message: "Invalid updates!" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    updates.forEach(update => {
      user[update] = req.body[update];
    });

    await user.save();
    
    // Return user with role field properly populated
    const updatedUser = await User.findById(req.params.id).select('-password');
    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(400).json({ message: "Failed to update user" });
  }
};

// Admin: delete user by ID
export const deleteUserById = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

// Add address to user profile
export const addAddress = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { type, street, city, state, zipCode, country, isDefault } = req.body;

    // If this is set as default, unset all other default addresses
    if (isDefault) {
      req.user.addresses.forEach(addr => addr.isDefault = false);
    }

    req.user.addresses.push({
      type,
      street,
      city,
      state,
      zipCode,
      country,
      isDefault: isDefault || req.user.addresses.length === 0 // First address is default
    });

    await req.user.save();
    res.json(req.user);
  } catch (error) {
    console.error("Error adding address:", error);
    res.status(400).json({ message: "Failed to add address" });
  }
};

// Update address
export const updateAddress = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { addressId } = req.params;
    const { type, street, city, state, zipCode, country, isDefault } = req.body;

    const address = req.user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    // If this is set as default, unset all other default addresses
    if (isDefault) {
      req.user.addresses.forEach(addr => addr.isDefault = false);
    }

    address.type = type || address.type;
    address.street = street || address.street;
    address.city = city || address.city;
    address.state = state || address.state;
    address.zipCode = zipCode || address.zipCode;
    address.country = country || address.country;
    address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;

    await req.user.save();
    res.json(req.user);
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(400).json({ message: "Failed to update address" });
  }
};

// Delete address
export const deleteAddress = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { addressId } = req.params;
    const address = req.user.addresses.id(addressId);
    
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    const wasDefault = address.isDefault;
    address.remove();

    // If we deleted the default address, make the first remaining address default
    if (wasDefault && req.user.addresses.length > 0) {
      req.user.addresses[0].isDefault = true;
    }

    await req.user.save();
    res.json(req.user);
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(400).json({ message: "Failed to delete address" });
  }
};
