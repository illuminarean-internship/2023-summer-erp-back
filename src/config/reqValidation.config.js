import Joi from 'joi';

// POST /api/users
const createUser = {
  body: Joi.object({
    username: Joi.string().required(),
    mobileNumber: Joi.string().required()
  })
};

// GET /api/users/:userId
const getUser = {
  params: Joi.object({
    userId: Joi.string().hex().required()
  })
};

// PUT /api/users/:userId
const updateUser = {
  body: Joi.object({
    username: Joi.string().required(),
    mobileNumber: Joi.string().required()
  }),
  params: Joi.object({
    userId: Joi.string().hex().required()
  })
};

// DELETE /api/users/:userId
const deleteUser = {
  params: Joi.object({
    userId: Joi.string().hex().required()
  })
};

// POST /api/auth/login
const login = {
  body: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
  })
};


// POST /api/items
const createItem = {
  body: Joi.object({
    modelname: Joi.string().required(),
    SerialNumber: Joi.string().required()
  })
};

// GET /api/items/:itemId
const getItem = {
  params: Joi.object({
    itemId: Joi.string().hex().required()
  })
};

// PUT /api/items/:itemId
const updateItem = {
  body: Joi.object({
    modelname: Joi.string().required(),
    SerialNumber: Joi.string().required()
  }),
  params: Joi.object({
    itemId: Joi.string().hex().required()
  })
};

// DELETE /api/items/:itemId
const deleteItem = {
  params: Joi.object({
    itemId: Joi.string().hex().required()
  })
};


export default {
  createUser,
  getUser,
  updateUser,
  deleteUser,
  login,
  createItem,
  getItem,
  updateItem,
  deleteItem
};
