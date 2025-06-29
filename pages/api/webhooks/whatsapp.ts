import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      // Webhook verification (Meta requires this)
      return handleWebhookVerification(req, res);
    } else if (req.method === 'POST') {
      // Handle incoming webhook events
      return handleWebhookEvent(req, res);
    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

// Handle webhook verification challenge from Meta
function handleWebhookVerification(req: NextApiRequest, res: NextApiResponse) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

  if (!verifyToken) {
    console.error('WHATSAPP_WEBHOOK_VERIFY_TOKEN not configured');
    return res.status(500).json({ error: 'Webhook verify token not configured' });
  }

  // Check if mode and token sent are correct
  if (mode === 'subscribe' && token === verifyToken) {
    console.log('Webhook verified successfully!');
    return res.status(200).send(challenge);
  } else {
    console.error('Webhook verification failed. Mode:', mode, 'Token match:', token === verifyToken);
    return res.status(403).json({ error: 'Forbidden' });
  }
}

// Handle incoming webhook events
async function handleWebhookEvent(req: NextApiRequest, res: NextApiResponse) {
  const body = req.body;

  console.log('Received webhook:', JSON.stringify(body, null, 2));

  // Check if this is a WhatsApp Business API webhook
  if (body.object === 'whatsapp_business_account') {
    if (body.entry && body.entry.length > 0) {
      for (const entry of body.entry) {
        // Process each change in the entry
        if (entry.changes && entry.changes.length > 0) {
          for (const change of entry.changes) {
            await processWebhookChange(change);
          }
        }
      }
    }
  }

  // Return 200 OK to acknowledge receipt
  return res.status(200).json({ success: true });
}

async function processWebhookChange(change: any) {
  try {
    console.log('Processing webhook change:', JSON.stringify(change, null, 2));

    if (change.field === 'messages') {
      const value = change.value;

      // Handle message status updates
      if (value.statuses && value.statuses.length > 0) {
        for (const status of value.statuses) {
          await handleMessageStatus(status);
        }
      }

      // Handle incoming messages (if you want to support replies)
      if (value.messages && value.messages.length > 0) {
        for (const message of value.messages) {
          await handleIncomingMessage(message);
        }
      }
    }
  } catch (error) {
    console.error('Error processing webhook change:', error);
  }
}

async function handleMessageStatus(status: any) {
  try {
    const { id: messageId, status: messageStatus, timestamp, recipient_id } = status;

    console.log(`Message ${messageId} status: ${messageStatus} for recipient ${recipient_id}`);

    // Update campaign logs based on message status
    const campaigns = await prisma.whatsAppCampaign.findMany({
      where: {
        recipients: {
          has: recipient_id
        }
      }
    });

    for (const campaign of campaigns) {
      // Create a log entry for this status update
      await prisma.whatsAppCampaignLog.create({
        data: {
          campaignId: campaign.id,
          action: messageStatus.toUpperCase(),
          details: {
            messageId,
            status: messageStatus,
            timestamp,
            recipientId: recipient_id
          },
          phoneNumber: recipient_id
        }
      });

      // Update campaign statistics based on status
      const updateData: any = {};

      switch (messageStatus) {
        case 'delivered':
          // Message was delivered to WhatsApp servers
          updateData.deliveredCount = {
            increment: 1
          };
          break;
        case 'read':
          // Message was read by recipient
          updateData.readCount = {
            increment: 1
          };
          break;
        case 'failed':
          // Message failed to deliver
          updateData.failedCount = {
            increment: 1
          };
          updateData.failedNumbers = {
            push: recipient_id
          };
          break;
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.whatsAppCampaign.update({
          where: { id: campaign.id },
          data: updateData
        });
      }
    }
  } catch (error) {
    console.error('Error handling message status:', error);
  }
}

async function handleIncomingMessage(message: any) {
  try {
    const { from, id: messageId, type, timestamp } = message;

    console.log(`Received ${type} message from ${from}: ${messageId}`);

    // Log incoming message (could be used for auto-replies or customer service)
    await prisma.whatsAppCampaignLog.create({
      data: {
        campaignId: 'incoming', // Special ID for incoming messages
        action: 'INCOMING_MESSAGE',
        details: {
          messageId,
          from,
          type,
          timestamp,
          message
        },
        phoneNumber: from
      }
    });

    // You could implement auto-reply logic here
    // For example, send a welcome message for first-time contacts

  } catch (error) {
    console.error('Error handling incoming message:', error);
  }
}
