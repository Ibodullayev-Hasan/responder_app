import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'; // <-- 1. HttpModule ni chaqiramiz
import { InstagramService } from './instagram.service';
import { InstagramController } from './instagram.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FaqRule } from './entities/faq-rule.entity';
import { ProcessedMessage } from './entities/processed-message.entity';
import { FaqService } from './faq.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FaqRule, ProcessedMessage]),
    HttpModule,
  ],
  controllers: [InstagramController],
  providers: [InstagramService, FaqService],
  exports: [InstagramService],
})
export class InstagramModule { }