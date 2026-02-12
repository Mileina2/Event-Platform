/**
 * User controller - HTTP handling only
 */

function createUserController(userService) {
  return {
    list(req, res) {
      const users = userService.list();
      res.json(users);
    },

    getById(req, res) {
      const id = parseInt(req.params.id, 10);
      const user = userService.getById(id);
      res.json(user);
    }
  };
}

module.exports = { createUserController };
