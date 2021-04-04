const User = require('./schemas/user')

const create = async ({ email, password, verificationToken }) => {
  const user = new User({
    email,
    password,
    verificationToken,
  })
  return await user.save()
}

const findByField = async (field) => {
  return await User.findOne(field)
}

const updateByField = async (field, updateData) => {
  return await User.findOneAndUpdate(field, updateData)
}

const updateAvatar = async (id, avatarURL, avatarIdCloud) => {
  return await User.updateOne({ _id: id }, { avatarURL, avatarIdCloud })
}

// const updateUserSubscription = async (id, name) => {
//   const result = await User.findOneAndUpdate(id, { name }, { new: true })
//   return result
// }

module.exports = {
  findByField,
  create,
  updateAvatar,
  updateByField,
  // updateUserSubscription,
}
