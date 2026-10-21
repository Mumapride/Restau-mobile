const {
  getPublishedAnnouncements,
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  setPublishStatus,
} = require('./announcements.service');

// Students — published only
const getPublished = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const data = await getPublishedAnnouncements(limit);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin — all including drafts
const getAll = async (req, res) => {
  try {
    const data = await getAllAnnouncements();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const create = async (req, res) => {
  try {
    const { title, body, isPublished } = req.body;
    if (!title || !body) {
      return res.status(400).json({ message: 'Title and body are required' });
    }
    const data = await createAnnouncement({ title, body, isPublished });
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { title, body } = req.body;
    const data = await updateAnnouncement(req.params.id, { title, body });
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const publish = async (req, res) => {
  try {
    const { isPublished } = req.body;
    const data = await setPublishStatus(req.params.id, isPublished);
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getPublished, getAll, create, update, publish };