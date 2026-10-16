import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class InstagramService {
  constructor(private readonly http: HttpService) {}

  async processWebhook(body: any) {
    if (body.object !== 'instagram') return;

    for (const entry of body.entry ?? []) {
      for (const event of entry.messaging ?? []) {
        const senderId = event.sender?.id;
        const text = event.message?.text;

        // O'z xabarlaringiz (echo) ga javob bermang, aks holda cheksiz loop bo'ladi
        if (!senderId || !text || event.message?.is_echo) continue;

        await this.sendText(senderId, this.buildReply(text));
      }
    }
  }

  private buildReply(text: string): string {
    const t = text.toLowerCase();
    if (t.includes('narx')) return "Narxlar haqida ma'lumot: ...";
    if (t.includes('salom')) return 'Assalomu alaykum! Qanday yordam bera olaman?';
    return "Xabaringiz uchun rahmat! Tez orada javob beramiz.";
  }

  private async sendText(recipientId: string, text: string) {
    await firstValueFrom(
      this.http.post(
        'https://graph.instagram.com/v23.0/me/messages',
        { recipient: { id: recipientId }, message: { text } },
        { headers: { Authorization: `Bearer ${process.env.IG_ACCESS_TOKEN}` } },
      ),
    );
  }
}