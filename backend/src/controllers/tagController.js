/**
 * Tag controller - HTTP handling for tags
 */

function createTagController(tagRepository) {
  return {
    listAll(req, res) {
      const tags = tagRepository.findAll();
      res.json(tags);
    },

    create(req, res) {
      const { name, color } = req.body;
      if (!name) return res.status(422).json({ error: 'Name required' });
      const tag = tagRepository.create(name, color);
      res.json(tag);
    },

    getEventTags(req, res) {
      const eventId = parseInt(req.params.eventId, 10);
      const tags = tagRepository.getEventTags(eventId);
      res.json(tags);
    },

    setEventTags(req, res) {
      const eventId = parseInt(req.params.eventId, 10);
      const { tagIds } = req.body;
      if (!Array.isArray(tagIds)) {
        return res.status(422).json({ error: 'tagIds must be an array' });
      }
      tagRepository.setEventTags(eventId, tagIds);
      res.json(tagRepository.getEventTags(eventId));
    }
  };
}

module.exports = { createTagController };
