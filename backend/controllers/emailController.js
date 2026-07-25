const transporter = require('../config/emailConfig');
const supabase = require('../config/supabaseConfig');
require('dotenv').config();

// Send approval email with verification buttons
const sendApprovalEmail = async (req, res) => {
  try {
    console.log('📧 Received request to send email:', req.body);
    
    const { email, name, playerId } = req.body;

    if (!email || !name || !playerId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, name and playerId are required' 
      });
    }

    // First update player status to 'pending_approval' (not fully approved yet)
    const { error: updateError } = await supabase
      .from('players')
      .update({ 
        approval_status: 'pending_verification',
        email_sent: true,
        email_sent_at: new Date().toISOString()
      })
      .eq('id', playerId);

    if (updateError) throw updateError;

    const frontendUrl = process.env.FRONTEND_URL || 'https://hyderabadiboyz.netlify.app';
    
    // Verification links
    const verifyYesUrl = `${frontendUrl}/verify-email?token=${playerId}&response=yes`;
    const verifyNoUrl = `${frontendUrl}/verify-email?token=${playerId}&response=no`;

    // Email HTML template with better design
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Hyderabadi Boyz</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #0a0a0a;
            color: #ffffff;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, #0a0a0a, #1a1a1a);
            padding: 40px;
            border-radius: 15px;
            border: 2px solid #FFD700;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #FFD700;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 32px;
            color: #FFD700;
            font-weight: bold;
          }
          .logo span { color: #ffffff; }
          .gold-text { color: #FFD700; }
          .content { line-height: 1.8; color: #cccccc; }
          .button-container {
            display: flex;
            gap: 20px;
            justify-content: center;
            margin: 30px 0;
            flex-wrap: wrap;
          }
          .btn {
            display: inline-block;
            padding: 14px 40px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: bold;
            font-size: 16px;
            transition: all 0.3s ease;
            text-align: center;
            min-width: 150px;
          }
          .btn-yes {
            background: linear-gradient(135deg, #FFD700, #DAA520);
            color: #0a0a0a;
            border: none;
          }
          .btn-yes:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 30px rgba(255,215,0,0.3);
          }
          .btn-no {
            background: transparent;
            color: #e74c3c;
            border: 2px solid #e74c3c;
          }
          .btn-no:hover {
            background: #e74c3c;
            color: #ffffff;
            transform: translateY(-3px);
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #333;
            color: #666;
            font-size: 12px;
          }
          .highlight { color: #FFD700; font-weight: bold; }
          .info-box {
            background: rgba(255,215,0,0.05);
            border: 1px solid rgba(255,215,0,0.1);
            border-radius: 10px;
            padding: 15px;
            margin: 20px 0;
          }
          .info-box p { margin: 5px 0; }
          .divider {
            border: none;
            border-top: 1px solid rgba(255,215,0,0.1);
            margin: 25px 0;
          }
          .warning-box {
            background: rgba(231,76,60,0.1);
            border: 1px solid rgba(231,76,60,0.3);
            border-radius: 10px;
            padding: 15px;
            margin: 15px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">💪 Hyderabadi <span>Boyz</span></div>
            <p style="color: #888; margin-top: 5px;">Hyderabad's Premier Armwrestling Team</p>
          </div>

          <div class="content">
            <h2 style="color: #FFD700;">🎉 Welcome ${name}!</h2>
            
            <p>Dear <span class="highlight">${name}</span>,</p>
            
            <p>Your registration for <span class="highlight">Hyderabadi Boyz</span> has been received and is pending verification.</p>

            <div class="info-box">
              <p><strong>📝 Registration Details:</strong></p>
              <p>• <strong>Name:</strong> ${name}</p>
              <p>• <strong>Status:</strong> <span style="color: #f39c12;">⏳ Pending Verification</span></p>
              <p>• <strong>Team:</strong> Hyderabadi Boyz</p>
            </div>

            <hr class="divider">

            <p style="font-size: 18px; text-align: center;">
              <strong style="color: #FFD700;">Please verify your registration</strong>
            </p>

            <p style="color: #aaa; text-align: center;">
              Click <strong style="color: #FFD700;">YES</strong> if this is you, or <strong style="color: #e74c3c;">NO</strong> if this is not your registration.
            </p>

            <div class="warning-box">
              <p style="color: #f39c12; margin: 0;">
                ⚠️ <strong>Important:</strong> Your registration will only be <strong style="color: #2ecc71;">APPROVED</strong> after you click <strong style="color: #FFD700;">YES</strong>.
              </p>
            </div>

            <div class="button-container">
              <a href="${verifyYesUrl}" class="btn btn-yes">✅ Yes, this is me</a>
              <a href="${verifyNoUrl}" class="btn btn-no">❌ No, not me</a>
            </div>

            <p style="color: #888; font-size: 14px; text-align: center;">
              🔒 This verification ensures your email address is correct.
            </p>

            <hr class="divider">

            <div style="color: #888; font-size: 14px;">
              <p><strong>📌 What happens next?</strong></p>
              <p>• After verification, you will be officially added to the team</p>
              <p>• You will receive match schedules and updates</p>
              <p>• You can participate in upcoming tournaments</p>
            </div>

            <div style="margin-top: 20px; padding: 15px; background: rgba(255,215,0,0.03); border-radius: 10px; border-left: 3px solid #FFD700;">
              <p style="color: #aaa; margin: 0;">
                <strong>💪 "Champions are not made in the gym. Champions are made from something they have deep inside them—a desire, a dream, a vision."</strong>
              </p>
              <p style="color: #888; margin-top: 5px; text-align: right;">— Hyderabadi Boyz Team</p>
            </div>
          </div>

          <div class="footer">
            <p>© 2024 Hyderabadi Boyz. All rights reserved.</p>
            <p>Building the future of armwrestling in Hyderabad 🇵🇰</p>
            <p style="color: #444; margin-top: 10px;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `✅ Verify Your Registration - Hyderabadi Boyz ${name}`,
      html: htmlContent
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to:', email);

    res.status(200).json({
      success: true,
      message: `Verification email sent to ${email}`
    });

  } catch (error) {
    console.error('❌ Error sending email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email: ' + error.message
    });
  }
};

// Handle email verification response
const verifyEmailResponse = async (req, res) => {
  try {
    const { token, response } = req.query;
    console.log('📧 Verification request:', { token, response });

    if (!token || !response) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><title>Invalid Request</title></head>
        <body style="background:#0a0a0a;color:white;display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;">
          <div style="text-align:center;padding:40px;border:2px solid #e74c3c;border-radius:15px;">
            <h1 style="color:#e74c3c;">❌ Invalid Request</h1>
            <p>Missing verification token or response.</p>
          </div>
        </body>
        </html>
      `);
    }

    if (response === 'yes') {
      // Update player: APPROVED
      const { error } = await supabase
        .from('players')
        .update({ 
          approval_status: 'approved',
          status: 'approved',
          email_verified: true,
          verification_response: 'yes',
          verified_at: new Date().toISOString()
        })
        .eq('id', token);

      if (error) throw error;

      // Get player name
      const { data: playerData } = await supabase
        .from('players')
        .select('fullname')
        .eq('id', token)
        .single();

      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>🎉 Verified - Hyderabadi Boyz</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #0a0a0a;
              color: #ffffff;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
            }
            .container {
              max-width: 500px;
              background: linear-gradient(135deg, #0a0a0a, #1a1a1a);
              padding: 40px;
              border-radius: 15px;
              border: 2px solid #FFD700;
              text-align: center;
            }
            .icon { font-size: 64px; margin-bottom: 20px; }
            .gold-text { color: #FFD700; }
            .success { color: #2ecc71; }
            .btn {
              display: inline-block;
              padding: 12px 30px;
              background: linear-gradient(135deg, #FFD700, #DAA520);
              color: #0a0a0a;
              border: none;
              border-radius: 8px;
              text-decoration: none;
              font-weight: bold;
              margin-top: 20px;
              transition: all 0.3s ease;
            }
            .btn:hover {
              transform: translateY(-3px);
              box-shadow: 0 10px 30px rgba(255,215,0,0.3);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">🎉</div>
            <h1 style="color: #FFD700;">Registration Verified!</h1>
            <p style="color: #aaa; font-size: 18px;">
              Thank you <strong class="gold-text">${playerData?.fullname || 'Player'}</strong>!
            </p>
            <p style="color: #2ecc71; font-size: 20px; font-weight: bold;">
              ✅ Your registration is now APPROVED!
            </p>
            <p style="color: #888; margin-top: 10px;">
              You are now officially part of <strong class="gold-text">Hyderabadi Boyz</strong>! 🎊
            </p>
            <p style="color: #888;">
              You will receive match schedules and updates soon.
            </p>
            <a href="${process.env.FRONTEND_URL || 'https://hyderabadiboyz.netlify.app'}" class="btn">
              🏠 Go to Website
            </a>
          </div>
        </body>
        </html>
      `);

    } else {
      // Player said NO - mark as rejected
      const { error } = await supabase
        .from('players')
        .update({ 
          approval_status: 'rejected',
          status: 'pending',
          email_verified: false,
          verification_response: 'no',
          verified_at: new Date().toISOString()
        })
        .eq('id', token);

      if (error) throw error;

      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Response Recorded - Hyderabadi Boyz</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #0a0a0a;
              color: #ffffff;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
            }
            .container {
              max-width: 500px;
              background: linear-gradient(135deg, #0a0a0a, #1a1a1a);
              padding: 40px;
              border-radius: 15px;
              border: 2px solid #FFD700;
              text-align: center;
            }
            .icon { font-size: 64px; margin-bottom: 20px; }
            .gold-text { color: #FFD700; }
            .btn {
              display: inline-block;
              padding: 12px 30px;
              background: linear-gradient(135deg, #FFD700, #DAA520);
              color: #0a0a0a;
              border: none;
              border-radius: 8px;
              text-decoration: none;
              font-weight: bold;
              margin-top: 20px;
              transition: all 0.3s ease;
            }
            .btn:hover {
              transform: translateY(-3px);
              box-shadow: 0 10px 30px rgba(255,215,0,0.3);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">📝</div>
            <h1 style="color: #FFD700;">Response Recorded</h1>
            <p style="color: #aaa; font-size: 18px;">
              We've noted your response.
            </p>
            <p style="color: #f39c12;">
              If this wasn't you, please contact us immediately.
            </p>
            <p style="color: #888; margin-top: 10px;">
              Your registration will be reviewed by our team.
            </p>
            <a href="${process.env.FRONTEND_URL || 'https://hyderabadiboyz.netlify.app'}" class="btn">
              🏠 Go to Website
            </a>
          </div>
        </body>
        </html>
      `);
    }

  } catch (error) {
    console.error('❌ Error verifying email:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><title>Error</title></head>
      <body style="background:#0a0a0a;color:white;display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;">
        <div style="text-align:center;padding:40px;border:2px solid #e74c3c;border-radius:15px;">
          <h1 style="color:#e74c3c;">❌ Verification Failed</h1>
          <p>Something went wrong. Please contact support.</p>
          <p style="color:#888;font-size:14px;">Error: ${error.message}</p>
        </div>
      </body>
      </html>
    `);
  }
};

module.exports = {
  sendApprovalEmail,
  verifyEmailResponse
};