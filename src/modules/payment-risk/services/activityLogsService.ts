// services/prePaymentRiskService.ts
import { PrePaymentRiskService } from "./prePaymentRiskService";

export class ActivityLogsService {

  // Agregar estas funciones a tu PrePaymentRiskService existente

  // Activity Type styling functions
  static getActionTypeColor(actionType: string): string {
    const actionColors: Record<string, string> = {
      'PAYMENT_PLAN_OFFERING': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30',
      'Payment Plan Offered': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30',
      'REMINDER_SENT': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800/30',
      'PAYMENT_RECEIVED': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30',
      'FOLLOW_UP': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/30',
      'DISPUTE_RECEIVED': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30',
      'COLLECTION_CALL': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/30',
      'INVOICE_SENT': 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-400 dark:border-cyan-800/30',
      'PAYMENT_PLAN_CREATED': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30',
      'ESCALATION': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30',
    };

    const normalizedType = actionType.toUpperCase().replace(/\s+/g, '_');
    return actionColors[normalizedType] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800/30';
  }

  // Contact Method styling functions
  static getContactMethodColor(method: string): string {
    const methodColors: Record<string, string> = {
      'EMAIL': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30',
      'Call': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30',
      'PHONE': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30',
      'SMS': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/30',
      'LETTER': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800/30',
      'IN_PERSON': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/30',
    };
    return methodColors[method.toUpperCase()] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800/30';
  }

  // Format date with time (enhanced version)
  static formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Simple HTML sanitizer for activity logs
  static sanitizeHtml(html: string): string {
    if (!html) return '';

    // Remove script tags and their content
    let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Remove dangerous attributes
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*"[^"]*"/gi, ''); // onclick, onload, etc.
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*'[^']*'/gi, '');
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/data:/gi, '');

    // Remove form elements
    sanitized = sanitized.replace(/<(form|input|textarea|select|button)[^>]*>.*?<\/\1>/gi, '');
    sanitized = sanitized.replace(/<(form|input|textarea|select|button)[^>]*\/?>/gi, '');

    return sanitized;
  }

  // Activity log utility functions
  static getActionTypePriority(actionType: string): 'high' | 'medium' | 'low' {
    const highPriority = ['ESCALATION', 'DISPUTE_RECEIVED', 'COLLECTION_CALL'];
    const mediumPriority = ['PAYMENT_PLAN_OFFERING', 'REMINDER_SENT', 'FOLLOW_UP'];

    const normalizedType = actionType.toUpperCase().replace(/\s+/g, '_');

    if (highPriority.includes(normalizedType)) return 'high';
    if (mediumPriority.includes(normalizedType)) return 'medium';
    return 'low';
  }

  // Check if action requires response
  static actionRequiresResponse(actionType: string): boolean {
    const responseRequired = [
      'PAYMENT_PLAN_OFFERING',
      'Payment Plan Offered',
      'REMINDER_SENT',
      'DISPUTE_RECEIVED',
      'FOLLOW_UP'
    ];

    return responseRequired.some(type =>
      type.toLowerCase() === actionType.toLowerCase() ||
      type.replace(/\s+/g, '_').toLowerCase() === actionType.toLowerCase()
    );
  }

  // Format activity summary for display
  static formatActivitySummary(summary: string | null, maxLength: number = 150): string {
    if (!summary) return 'No details available';

    // If it's HTML, strip tags for preview
    const textOnly = summary.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

    return PrePaymentRiskService.truncateText(textOnly, maxLength);
  }

  // Get response status text
  static getResponseStatusText(responseReceived: boolean | null): string {
    if (responseReceived === null) return 'N/A';
    return responseReceived ? 'Response received' : 'No response';
  }

  // Get response status color
  static getResponseStatusColor(responseReceived: boolean | null): string {
    if (responseReceived === null) return 'text-gray-500';
    return responseReceived ? 'text-green-500' : 'text-yellow-500';
  }


}