import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Configure Hostinger SMTP transport
const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 587,
  secure: false, // false for TLS
  auth: {
    user: process.env.EMAIL_USER, // Your full Hostinger email
    pass: process.env.EMAIL_PASS, // Your Hostinger email password
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify SMTP connection
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Connection Error:', error);
  } else {
    console.log('SMTP Server is ready to send emails');
  }
});

// Send reminder email endpoint
app.post('/api/send-reminder', async (req, res) => {
  const { to, toName, taskTitle, taskSubject, dueDate, priority, xpReward, reminderMessage, dashboardUrl } = req.body;

  // Create email HTML template
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Task Reminder</title>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 20px; }
        .header h1 { color: #6366f1; margin: 0; }
        .task-card { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .priority-high { color: #ef4444; }
        .priority-medium { color: #f59e0b; }
        .priority-low { color: #10b981; }
        .reminder-box { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        .button { background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; }
        .footer { text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📚 Student Planner Reminder</h1>
        </div>
        
        <p>Hello <strong>${toName}</strong>,</p>
        <p>This is your scheduled reminder for the following task:</p>
        
        <div class="task-card">
          <h2 style="color: #4f46e5; margin-top: 0;">${taskTitle}</h2>
          <p><strong>Subject:</strong> ${taskSubject}</p>
          <p><strong>Due Date:</strong> ${dueDate}</p>
          <p><strong>Priority:</strong> <span class="priority-${priority}">${priority}</span></p>
          <p><strong>XP Reward:</strong> +${xpReward} XP</p>
        </div>
        
        <div class="reminder-box">
          <p style="margin: 0; color: #92400e;">
            <strong>💡 Reminder Message:</strong><br>
            "${reminderMessage}"
          </p>
        </div>
        
        <div style="text-align: center;">
          <a href="${dashboardUrl}" class="button">View in Dashboard →</a>
        </div>
        
        <div class="footer">
          <p>You received this email because you set a reminder in Student Planner.</p>
          <p>© 2026 Student Planner | Stay organized, earn XP, and achieve your goals!</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Student Planner" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: `📚 Task Reminder: ${taskTitle}`,
    html: emailHtml,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test email endpoint
app.post('/api/test-email', async (req, res) => {
  const { to } = req.body;

  const mailOptions = {
    from: `"Student Planner" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: 'Test Email from Student Planner',
    html: '<h1>✅ Test Successful!</h1><p>Your Hostinger SMTP is working correctly.</p>',
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Test email sent!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Email API server running on port ${PORT}`);
});