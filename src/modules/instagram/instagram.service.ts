import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { FaqService } from './faq.service';
import { ProcessedMessage } from './entities/processed-message.entity';

@Injectable()
export class InstagramService {
  constructor(
    private readonly http: HttpService,
    private readonly faq: FaqService,
    @InjectRepository(ProcessedMessage)
    private readonly processed: Repository<ProcessedMessage>,
  ) { }

  async processWebhook(body: any) {
    if (body.object !== 'instagram') return;

    for (const entry of body.entry ?? []) {
      for (const event of entry.messaging ?? []) {
        const senderId = event.sender?.id;
        const text = event.message?.text;
        const mid = event.message?.mid;

        if (!senderId || !text || event.message?.is_echo) continue;
        if (mid && (await this.isDuplicate(mid))) continue;

        const reply = await this.faq.findAnswer(text);
        await this.sendText(senderId, reply);
      }
    }
  }

  // Meta bir xil eventni qayta yuborsa, ikkinchi marta javob bermaslik uchun
  private async isDuplicate(mid: string): Promise<boolean> {
    try {
      await this.processed.insert({ mid });
      return false;
    } catch (e: any) {
      if (e.code === '23505') return true; // PostgreSQL: takroriy kalit
      throw e;
    }
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