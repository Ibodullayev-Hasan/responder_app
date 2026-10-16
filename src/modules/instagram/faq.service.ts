import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FaqRule } from './entities/faq-rule.entity';

@Injectable()
export class FaqService implements OnModuleInit {
  constructor(
    @InjectRepository(FaqRule) private readonly rules: Repository<FaqRule>,
  ) {}

  // Jadval bo'sh bo'lsa, boshlang'ich qoidalarni o'zi qo'shadi
  async onModuleInit() {
    if ((await this.rules.count()) > 0) return;
    await this.rules.save([
      { keywords: ['fayl', 'file'], answer: 'Mana fayl: https://example.com/fayl.pdf', priority: 10 },
      { keywords: ['narx', 'qancha'], answer: "Narxlar haqida ma'lumot: ...", priority: 5 },
      { keywords: ['salom'], answer: 'Assalomu alaykum! Qanday yordam bera olaman?', priority: 1 },
    ]);
  }

  private normalize(text: string): string {
    return text
      .toLowerCase()
      .replace(/[ʻʼ`´’‘']/g, "'")
      .replace(/[^\p{L}\p{N}\s']/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  async findAnswer(text: string): Promise<string> {
    const normalized = this.normalize(text);
    const all = await this.rules.find({
      where: { isActive: true },
      order: { priority: 'DESC' },
    });
    const hit = all.find((r) =>
      r.keywords.some((k) => normalized.includes(this.normalize(k))),
    );
    return hit?.answer ?? 'Xabaringiz uchun rahmat! Tez orada javob beramiz.';
  }
}