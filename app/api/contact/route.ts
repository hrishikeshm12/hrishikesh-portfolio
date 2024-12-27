import { NextResponse } from 'next/server'
import sgMail from '@sendgrid/mail'

// Ensure the API key starts with "SG."
const apiKey = process.env.SENDGRID_API_KEY
if (!apiKey || !apiKey.startsWith('SG.')) {
  console.error('Invalid SendGrid API key format')
}

sgMail.setApiKey(apiKey as string)

export async function POST(request: Request) {
  const { name, email, message } = await request.json()

  // Ensure EMAIL_TO is set
  const toEmail = process.env.EMAIL_TO
  if (!toEmail) {
    console.error('EMAIL_TO is not set in environment variables')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const msg = {
    to: toEmail, // Use the email from environment variable
    from: process.env.EMAIL_FROM as string,
    subject: `New message from ${name} via Portfolio`,
    text: `
      Name: ${name}
      Email: ${email}
      Message: ${message}
    `,
    html: `
      <h1>New Contact Form Submission</h1>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
  }

  try {
    await sgMail.send(msg)
    return NextResponse.json({ message: 'Email sent successfully' })
  } catch (error) {
    console.error('Error sending email:', error)
    if (error.response) {
      console.error(error.response.body)
    }
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
