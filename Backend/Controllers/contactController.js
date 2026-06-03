import sendEmail from '../Utils/sendEmail.js';

export const sendContactEmail = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and message' });
    }

    const html = `
      <h3>New Contact Form Submission</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject || 'No subject'}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `;

    const targetEmail = process.env.CONTACT_EMAIL;

    const success = await sendEmail({
      email: targetEmail,
      subject: `Contact Form: ${subject || 'New Message from ' + name}`,
      html: html,
      from: `FitBox Support <${targetEmail}>`,
    });

    if (success) {
      res.status(200).json({ success: true, message: 'Email sent successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send email via Resend' });
    }
  } catch (error) {
    console.error('Error in sendContactEmail:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
