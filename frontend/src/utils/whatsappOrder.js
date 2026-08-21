/**
 * Generates a clean, formatted WhatsApp order message
 * @param {Object} params
 * @param {Array} params.cart
 * @param {Object} params.formData
 * @param {number} params.total
 * @returns {string} Encoded or raw WhatsApp message
 */
export const generateWhatsAppOrderMessage = ({ cart, formData, total, orderNumber }) => {
  const itemsText = cart
    .map((item, index) => {
      const price = Number(item.price || 0);
      const quantity = Number(item.quantity || 1);
      const subtotal = price * quantity;
      
      let itemLine = `${index + 1}. *${item.name}* (x${quantity}) - ₹${subtotal.toFixed(0)}`;
      
      const customDetails = [];
      if (item.selectedSize?.label) {
        customDetails.push(`   • Size: ${item.selectedSize.label}`);
      }
      if (item.selectedFlavor) {
        customDetails.push(`   • Flavor: ${item.selectedFlavor}`);
      }
      if (item.customMessage) {
        customDetails.push(`   • Plaque Message: "${item.customMessage}"`);
      }
      
      if (customDetails.length > 0) {
        itemLine += `\n${customDetails.join("\n")}`;
      }
      
      return itemLine;
    })
    .join("\n\n");

  const message = `🎂 *NEW BAKERY ORDER - BROWNIE HUB* 🎂
──────────────────────────────
${orderNumber ? `📋 *Order Ref:* ${orderNumber}\n──────────────────────────────\n` : ""}👤 *CUSTOMER DETAILS*
• Name: ${formData.fullName.trim()}
• Phone: ${formData.phone.trim()}
• Delivery Address: ${formData.address.trim()}${formData.landmark?.trim() ? ` (Near: ${formData.landmark.trim()})` : ""}
• Delivery Date: ${formData.deliveryDate}
• Preferred Slot: ${formData.deliveryTime}
${formData.customMessage?.trim() ? `• Order Greeting / Message: "${formData.customMessage.trim()}"\n` : ""}${formData.instructions?.trim() ? `• Special Baking Instructions: ${formData.instructions.trim()}\n` : ""}──────────────────────────────
🍰 *ORDER SUMMARY*
${itemsText}
──────────────────────────────
💰 *GRAND TOTAL:* ₹${Number(total || 0).toFixed(2)}
💵 *Payment Method:* Cash on Delivery / UPI on Delivery
──────────────────────────────
Please confirm this order and preparation time. Thank you!`;

  return message;
};

/**
 * Creates the full WhatsApp API URL for the bakery
 * @param {string} message
 * @param {string} phoneNumber - WhatsApp bakery phone number
 * @returns {string}
 */
export const getWhatsAppOrderUrl = (message, phoneNumber = "91XXXXXXXXXX") => {
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};
