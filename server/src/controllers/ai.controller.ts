import { Request, Response } from 'express';
import Parcel from '../models/Parcel';

const extractParcelId = (message: string): string | null => {
  const match = message.match(/P[-\s]?(\d{3,})/i);
  if (match) return `P-${match[1].padStart(3, '0')}`;
  return null;
};

const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
};

export const chat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message } = req.body;
    if (!message) { res.status(400).json({ message: 'Message is required' }); return; }

    const lowerMsg = message.toLowerCase().trim();
    const parcelId = extractParcelId(message);

    if (parcelId) {
      const parcel = await Parcel.findOne({ parcelId })
        .populate('senderId', 'name phone')
        .populate('receiverId', 'name phone address')
        .populate({ path: 'deliveryId', populate: { path: 'deliveryAgentId', select: 'name phone' } });

      if (!parcel) {
        res.json({
          response: `I couldn't find a parcel with ID **${parcelId}**. 🔍\n\nPlease check the Parcel ID and try again. Parcel IDs follow the format: **P-001**, **P-002**, etc.`
        });
        return;
      }

      const sender = parcel.senderId as any;
      const receiver = parcel.receiverId as any;
      const delivery = parcel.deliveryId as any;

      const statusEmoji: Record<string, string> = {
        'Booked': '📦',
        'In Transit': '🚚',
        'Out for Delivery': '🛵',
        'Delivered': '✅',
        'Delayed': '⚠️',
        'Cancelled': '❌'
      };
      const emoji = statusEmoji[parcel.status] || '📦';

      let response = `## ${emoji} Parcel Tracking Update\n\n`;
      response += `**Parcel ID:** ${parcel.parcelId}\n`;
      response += `**Status:** ${parcel.status}\n`;
      response += `**Weight:** ${parcel.weight} kg\n`;
      response += `**Estimated Delivery:** ${formatDate(parcel.estimatedDeliveryDate)}\n\n`;

      if (delivery) {
        response += `**Current Location:** ${delivery.currentLocation || 'Processing'}\n`;
        if (delivery.deliveryAgentId) {
          response += `**Delivery Agent:** ${delivery.deliveryAgentId.name} (${delivery.deliveryAgentId.phone || 'N/A'})\n`;
        }
      }

      if (sender) response += `\n**Sender:** ${sender.name}\n`;
      if (receiver) {
        response += `**Receiver:** ${receiver.name}\n`;
        if (receiver.address) response += `**Delivery Address:** ${receiver.address}\n`;
      }

      if (parcel.status === 'Delivered') {
        response += `\n✅ **This parcel has been successfully delivered!**`;
      } else if (parcel.status === 'Delayed') {
        response += `\n⚠️ **This parcel is experiencing a delay. We apologize for any inconvenience.**`;
      } else if (parcel.status === 'Out for Delivery') {
        response += `\n🛵 **Your parcel is out for delivery and should arrive today!**`;
      } else if (parcel.status === 'In Transit') {
        response += `\n🚚 **Your parcel is on the way to the destination city.**`;
      }

      res.json({ response, parcelData: parcel });
      return;
    }

    // Greeting
    if (lowerMsg.match(/^(hi|hello|hey|good|howdy)/)) {
      res.json({
        response: `Hello! 👋 I'm **SwiftShip AI**, your intelligent parcel tracking assistant.\n\nI can help you:\n- 📦 **Track any parcel** (e.g., "Track P-001")\n- 📍 **Find current location** of your parcel\n- 📅 **Check estimated delivery** dates\n- ⚖️ **Get parcel details** like weight and sender info\n\nJust type a Parcel ID like **P-001** and I'll fetch the latest information for you!`
      });
      return;
    }

    // Help
    if (lowerMsg.includes('help') || lowerMsg.includes('what can')) {
      res.json({
        response: `## SwiftShip AI — Help Guide\n\n**Track a Parcel:**\n- "Track parcel P-001"\n- "Where is P-002?"\n- "Status of P-003"\n\n**Delivery Information:**\n- "When will P-001 arrive?"\n- "What is the ETA for P-005?"\n\n**Parcel Details:**\n- "How much does P-001 weigh?"\n- "Show details for P-007"\n- "Who is delivering P-003?"\n\nSimply mention the **Parcel ID** and I'll retrieve the real-time information for you!`
      });
      return;
    }

    // Default
    res.json({
      response: `I'm here to help you track parcels! 📦\n\nTo track a parcel, please provide the **Parcel ID**. For example:\n- "Track **P-001**"\n- "Where is **P-005**?"\n- "When will **P-010** arrive?"\n\nType **help** to see all available commands.`
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
