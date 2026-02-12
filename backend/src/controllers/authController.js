/**
 * Auth controller - login & register
 */

function createAuthController(authService) {
  return {
    async login(req, res) {
      const { email, password } = req.body;
      const user = await authService.login(email, password);
      res.json(user);
    },

    async register(req, res) {
      const { email, password, role } = req.body;
      const user = await authService.register(email, password, role);
      res.status(201).json(user);
    }
  };
}

module.exports = { createAuthController };
