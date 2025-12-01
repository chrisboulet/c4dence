import { Resend } from 'resend'

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

// Email configuration
const FROM_EMAIL = process.env.EMAIL_FROM || 'C4dence <noreply@bouletstrategies.ca>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

type SendEmailResult = {
  success: boolean
  error?: string
  id?: string
}

/**
 * Send an invitation email to join an organization
 */
export async function sendInvitationEmail({
  to,
  organizationName,
  inviterName,
  token,
  role,
}: {
  to: string
  organizationName: string
  inviterName: string
  token: string
  role: string
}): Promise<SendEmailResult> {
  const inviteUrl = `${APP_URL}/invite/${token}`
  const roleLabel = role === 'ADMIN' ? 'Administrateur' : 'Membre'

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `Invitation à rejoindre ${organizationName} sur C4dence`,
      html: getInvitationEmailHtml({
        organizationName,
        inviterName,
        inviteUrl,
        roleLabel,
      }),
      text: getInvitationEmailText({
        organizationName,
        inviterName,
        inviteUrl,
        roleLabel,
      }),
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, id: data?.id }
  } catch (err) {
    console.error('Email send error:', err)
    return { success: false, error: 'Erreur lors de l\'envoi de l\'email' }
  }
}

/**
 * HTML template for invitation email
 */
function getInvitationEmailHtml({
  organizationName,
  inviterName,
  inviteUrl,
  roleLabel,
}: {
  organizationName: string
  inviterName: string
  inviteUrl: string
  roleLabel: string
}): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation C4dence</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse;">
          <!-- Header -->
          <tr>
            <td style="padding: 30px 40px; background: linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%); border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">C4dence</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Exécution Stratégique 4DX</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px; background-color: white; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="margin: 0 0 20px; color: #18181b; font-size: 22px; font-weight: 600;">
                Vous êtes invité(e)!
              </h2>

              <p style="margin: 0 0 16px; color: #52525b; font-size: 16px; line-height: 1.6;">
                <strong style="color: #18181b;">${inviterName}</strong> vous invite à rejoindre
                <strong style="color: #7c3aed;">${organizationName}</strong> sur C4dence.
              </p>

              <p style="margin: 0 0 24px; color: #52525b; font-size: 16px; line-height: 1.6;">
                Vous aurez le rôle de <strong>${roleLabel}</strong>.
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${inviteUrl}"
                       style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); color: white; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px; box-shadow: 0 4px 12px rgba(124,58,237,0.4);">
                      Accepter l'invitation
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0; color: #71717a; font-size: 14px; line-height: 1.6;">
                Cette invitation expire dans 7 jours.
              </p>

              <hr style="margin: 24px 0; border: none; border-top: 1px solid #e4e4e7;">

              <p style="margin: 0; color: #a1a1aa; font-size: 12px; line-height: 1.6;">
                Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur:<br>
                <a href="${inviteUrl}" style="color: #7c3aed; word-break: break-all;">${inviteUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px; text-align: center;">
              <p style="margin: 0; color: #a1a1aa; font-size: 12px;">
                C4dence — Plateforme d'exécution stratégique basée sur la méthodologie 4DX
              </p>
              <p style="margin: 8px 0 0; color: #a1a1aa; font-size: 12px;">
                © ${new Date().getFullYear()} Boulet Stratégies TI
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

/**
 * Plain text version of invitation email
 */
function getInvitationEmailText({
  organizationName,
  inviterName,
  inviteUrl,
  roleLabel,
}: {
  organizationName: string
  inviterName: string
  inviteUrl: string
  roleLabel: string
}): string {
  return `
Vous êtes invité(e) à rejoindre ${organizationName} sur C4dence!

${inviterName} vous invite à rejoindre ${organizationName}.
Vous aurez le rôle de ${roleLabel}.

Pour accepter l'invitation, cliquez sur le lien suivant:
${inviteUrl}

Cette invitation expire dans 7 jours.

---
C4dence — Plateforme d'exécution stratégique basée sur la méthodologie 4DX
© ${new Date().getFullYear()} Boulet Stratégies TI
`
}
