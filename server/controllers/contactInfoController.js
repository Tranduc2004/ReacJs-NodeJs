const ContactInfo = require("../models/ContactInfo");

// Lấy thông tin liên hệ
exports.getContactInfo = async (req, res) => {
  try {
    const contactInfo = await ContactInfo.findOne();
    res.json(contactInfo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật thông tin liên hệ
exports.updateContactInfo = async (req, res) => {
  try {
    const { address, location, phone, phoneNote, email, emailNote } = req.body;

    let contactInfo = await ContactInfo.findOne();

    if (!contactInfo) {
      contactInfo = new ContactInfo({
        address,
        location,
        phone,
        phoneNote,
        email,
        emailNote,
      });
    } else {
      contactInfo.address = address;
      contactInfo.location = location;
      contactInfo.phone = phone;
      contactInfo.phoneNote = phoneNote;
      contactInfo.email = email;
      contactInfo.emailNote = emailNote;
    }

    await contactInfo.save();
    res.json(contactInfo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
