import { NextRequest, NextResponse } from 'next/server'

/**
 * Application Confirmation Email API
 * 
 * Sends confirmation email to applicant with:
 * - Application reference number
 * - Next 4 steps in the process
 * - Contact information
 * 
 * TODO: Integrate with actual email service (SendGrid, AWS SES, etc.) when going live
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { applicationRef } = body

    if (!applicationRef) {
      return NextResponse.json(
        { success: false, message: 'Application reference is required' },
        { status: 400 }
      )
    }

    // TODO: Fetch application details from database
    // const application = await getApplicationByRef(applicationRef)
    // const applicantEmail = application.email
    // const applicantName = application.firstName

    // Email content with next 4 steps
    const emailContent = {
      to: 'applicant@example.com', // TODO: Replace with actual applicant email
      subject: `Day1Health Application Confirmation - ${applicationRef}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
            .ref-box { background: #dbeafe; border: 2px solid #3b82f6; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
            .ref-number { font-size: 24px; font-weight: bold; color: #1e40af; font-family: monospace; }
            .step { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #10b981; border-radius: 4px; }
            .step-number { display: inline-block; width: 30px; height: 30px; background: #10b981; color: white; border-radius: 50%; text-align: center; line-height: 30px; font-weight: bold; margin-right: 10px; }
            .footer { background: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #6b7280; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Application Submitted Successfully!</h1>
            </div>
            
            <div class="content">
              <p>Dear Applicant,</p>
              
              <p>Thank you for applying with Day1Health! Your application has been successfully submitted.</p>
              
              <div class="ref-box">
                <p style="margin: 0; font-size: 14px; color: #1e40af;">Your Application Reference Number:</p>
                <p class="ref-number">${applicationRef}</p>
                <p style="margin: 0; font-size: 12px; color: #1e40af;">Please save this number for your records</p>
              </div>
              
              <h2 style="color: #10b981; margin-top: 30px;">What Happens Next?</h2>
              
              <div class="step">
                <span class="step-number">1</span>
                <strong>Application Review</strong>
                <p style="margin: 5px 0 0 40px; color: #6b7280;">Our team will review your application and verify your documents within 1 hour.</p>
              </div>
              
              <div class="step">
                <span class="step-number">2</span>
                <strong>Confirmation Call</strong>
                <p style="margin: 5px 0 0 40px; color: #6b7280;">You'll receive a confirmation call shortly to verify your details and answer any questions.</p>
              </div>
              
              <div class="step">
                <span class="step-number">3</span>
                <strong>Approval & Activation</strong>
                <p style="margin: 5px 0 0 40px; color: #6b7280;">Once approved, your cover will be activated and your first debit order will be processed.</p>
              </div>
              
              <div class="step">
                <span class="step-number">4</span>
                <strong>Welcome Pack</strong>
                <p style="margin: 5px 0 0 40px; color: #6b7280;">You'll receive your member card, policy documents, and welcome pack via email and post.</p>
              </div>
              
              <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #92400e;"><strong>📧 Keep this email safe</strong> - You may need your reference number for future correspondence.</p>
              </div>
              
              <h3 style="color: #374151; margin-top: 30px;">Need Help?</h3>
              <p style="color: #6b7280;">
                📞 Call us: <strong>0800 DAY1 HEALTH</strong><br>
                📧 Email: <strong>applications@day1health.co.za</strong><br>
                ⏰ Hours: <strong>Monday - Friday: 8:00 AM - 5:00 PM</strong>
              </p>
            </div>
            
            <div class="footer">
              <p>This is an automated confirmation email from Day1Health.</p>
              <p style="margin: 5px 0;">© ${new Date().getFullYear()} Day1Health. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Day1Health Application Confirmation

Application Reference: ${applicationRef}

Thank you for applying with Day1Health! Your application has been successfully submitted.

What Happens Next?

1. Application Review
   Our team will review your application and verify your documents within 1 hour.

2. Confirmation Call
   You'll receive a confirmation call shortly to verify your details and answer any questions.

3. Approval & Activation
   Once approved, your cover will be activated and your first debit order will be processed.

4. Welcome Pack
   You'll receive your member card, policy documents, and welcome pack via email and post.

Need Help?
Call us: 0800 DAY1 HEALTH
Email: applications@day1health.co.za
Hours: Monday - Friday: 8:00 AM - 5:00 PM

Please keep this email safe - You may need your reference number for future correspondence.

© ${new Date().getFullYear()} Day1Health. All rights reserved.
      `.trim()
    }

    // TODO: Send email via email service when going live
    // Example with SendGrid:
    // await sendEmail({
    //   to: applicantEmail,
    //   from: 'noreply@day1health.co.za',
    //   subject: emailContent.subject,
    //   html: emailContent.html,
    //   text: emailContent.text,
    // })

    // For now, just log the email content
    console.log('📧 Confirmation email prepared for:', applicationRef)
    console.log('Email content ready for integration with email service')

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 500))

    return NextResponse.json({
      success: true,
      message: 'Confirmation email sent successfully',
      emailContent: emailContent, // Remove this in production
    })

  } catch (error) {
    console.error('Email sending error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to send confirmation email' 
      },
      { status: 500 }
    )
  }
}
