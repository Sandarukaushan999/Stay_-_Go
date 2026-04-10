// Re-export the merged User model to prevent Mongoose OverwriteModelError
// while maintaining import paths for controllers in this module.
export { User } from '../../modules/users/user.model.js'
